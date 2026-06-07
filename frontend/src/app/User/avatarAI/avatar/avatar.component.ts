import { AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AvatarService } from '../../../Services/avatar/avatar.service';
import { AnimationService } from '../../../Services/avatar/avatarOthers/animation.service';
import { AudioService } from '../../../Services/avatar/audio.service';
import { LipSyncService, Viseme } from '../../../Services/avatar/lipsync.service';
import { EmotionType } from '../../../Model/emotion.model';
import { AvatarResponse } from '../../../Model/AvatarResponse.model';
import { Product } from '../../../Model/Product.model';

interface ChatMessage {
  sender: 'user' | 'avatar';
  text: string;
  emotion?: EmotionType;
}

@Component({
  selector: 'app-avatar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.css'
})
export class AvatarComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef;
  @ViewChild('avatarContainer') avatarContainerRef!: ElementRef;
  @ViewChild('bubbleContainer') bubbleContainerRef!: ElementRef;
  @Output() closed = new EventEmitter<void>();

  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private model: any = null;
  private morphTargets: any = {};
  private currentEmotion: EmotionType = 'NEUTRAL';
  private clock: THREE.Clock = new THREE.Clock();
  private subscriptions = new Subscription();
  private removeEventListeners: Array<() => void> = [];
  // Waving animation
  private waveBone: any = null;
  private waveAnimationId: any = null;
  private visemeResetTimer: ReturnType<typeof setTimeout> | null = null;
  private defaultAnimationName: string | null = null;
  private speakingAnimationName: string | null = null;

  // Mouse rotation
  private mouseX = 0;
  private mouseY = 0;
  private targetRotationX = 0;
  private targetRotationY = 0;
  private isDragging = false;
  private blinkInterval: any = null;
  private animationFrameId: number | null = null;
  isActive = false;
  isHoveringEnabled = false;
  isSpeaking = false;
  messages: ChatMessage[] = [];
  userInput = '';
  loading = false;
  recommendedProducts: Product[] = [];

  constructor(
    private avatarService: AvatarService,
    private animationService: AnimationService,
    private audioService: AudioService,
    private lipSyncService: LipSyncService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Initialize with greeting message
    this.messages.push({
      sender: 'avatar',
      text: "Hello! I'm your shopping assistant. Ask me anything about our products!",
      emotion: 'HAPPY',
    });
    this.avatarService.setEmotion('HAPPY');

    this.subscriptions.add(
      this.avatarService.emotion$.subscribe((emotion: EmotionType) => {
        this.currentEmotion = emotion;
        this.applyEmotion(emotion);
      }),
    );

    // Subscribe to blink trigger from service
    this.subscriptions.add(
      this.avatarService.blink$.subscribe(() => {
        this.performBlink();
      }),
    );

      // Subscribe to viseme events from LipSyncService and apply morphs
      this.subscriptions.add(
        this.lipSyncService.viseme$.subscribe((viseme: string) => {
          this.applyVisemeToMorph(viseme);
        }),
      );
  }

  onAvatarClick(): void {
    this.isActive = true;
    // Wait for CSS transition and DOM layout before resizing renderer
    setTimeout(() => {
      this.moveCanvasToModal();
      this.onWindowResize();
    }, 350);
  }

  closeAvatar(event?: MouseEvent): void {
    event?.stopPropagation();
    this.isActive = false;
    this.isHoveringEnabled = false;
    this.moveCanvasToBubble();
    this.stopPlayback();
    setTimeout(() => this.onWindowResize(), 350);
    this.closed.emit();
  }

  toggleHoverMode(): void {
    this.isHoveringEnabled = !this.isHoveringEnabled;
  }

  minimizeAvatar(event?: MouseEvent): void {
    // Collapse modal back to small avatar bubble without stopping playback or unloading model
    event?.stopPropagation();
    this.isActive = false;
    this.moveCanvasToBubble();
    setTimeout(() => this.onWindowResize(), 350);
    // keep isHoveringEnabled state as-is; don't stop audio or animations
  }

  private stopPlayback(): void {
    this.audioService.stop();
    this.lipSyncService.stop();
    this.stopSpeakingAnimation();
  }

  private moveCanvasToModal(): void {
    if (this.renderer && this.avatarContainerRef) {
      const container = this.avatarContainerRef.nativeElement;
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(this.renderer.domElement);

      // ← ADD THIS: resize renderer to fit the new container
      this.resizeRendererToContainer(container);
    }
  }

  private moveCanvasToBubble(): void {
    if (this.renderer && this.canvasRef) {
      const container = this.canvasRef.nativeElement;
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      container.appendChild(this.renderer.domElement);

      // ← ADD THIS: resize renderer to fit the bubble
      this.resizeRendererToContainer(container);
    }
  }

  private resizeRendererToContainer(container: HTMLElement): void {
    // Wait one frame for the container to have real dimensions
    requestAnimationFrame(() => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      if (width === 0 || height === 0) return;

      this.renderer.setSize(width, height);
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
    });
  }
  setEmotion(emotion: EmotionType): void {
    this.avatarService.setEmotion(emotion);
  }

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    this.messages.push({
      sender: 'user',
      text: this.userInput,
    });

    const userMessage = this.userInput;
    this.userInput = '';
    this.loading = true;

    this.avatarService.sendMessage({ message: userMessage }).subscribe({
      next: (response: AvatarResponse) => {
        console.log('Avatar backend response:', response);
        this.loading = false;

        const emotion: EmotionType =
          this.avatarService.mapBackendEmotionToAvatar(response.emotion) || 'HAPPY';

        this.messages.push({
          sender: 'avatar',
          text: response.chatResponse,
          emotion: emotion,
        });

        this.recommendedProducts = response.recommendedProducts ?? [];

        this.avatarService.setEmotion(emotion);
        // If backend provided an audioUrl, play it and start lip-sync if visemes provided
        if (response.audioUrl) {
          const audioEl = this.audioService.playUrl(response.audioUrl);
          this.startSpeakingAnimation();
          audioEl.addEventListener('ended', () => this.stopSpeakingAnimation(), { once: true });
          if (response.visemes && response.visemes.length) {
            // Convert to Viseme[] (already matching shape)
            const vis: Viseme[] = response.visemes.map(v => ({ time: v.time, viseme: v.viseme }));
            this.lipSyncService.start(vis, audioEl);
          }
        }
      },
      error: (err) => {
        this.loading = false;
        this.messages.push({
          sender: 'avatar',
          text: 'Sorry, I encountered an error. Please try again.',
          emotion: 'SAD',
        });
        this.avatarService.setEmotion('SAD');
      },
    });
  }

  testEmotion(emotion: EmotionType): void {
    this.messages.push({
      sender: 'avatar',
      text: `Testing ${emotion} emotion...`,
      emotion: emotion,
    });
    this.avatarService.setEmotion(emotion);
  }

  testBlink(): void {
    this.messages.push({
      sender: 'avatar',
      text: 'Testing blink animation...',
      emotion: 'NEUTRAL',
    });
    this.avatarService.triggerBlink();
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.loadAvatar();
    this.animate();
  }

  ngOnDestroy(): void {
    this.stopPlayback();

    this.subscriptions.unsubscribe();

    this.removeEventListeners.forEach((removeListener) => removeListener());
    this.removeEventListeners = [];

    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
      this.blinkInterval = null;
    }

    if (this.waveAnimationId) {
      cancelAnimationFrame(this.waveAnimationId);
      this.waveAnimationId = null;
    }

    if (this.visemeResetTimer) {
      clearTimeout(this.visemeResetTimer);
      this.visemeResetTimer = null;
    }

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.renderer) {
      this.renderer.dispose();
    }
  }

  private initThreeJS(): void {
    this.scene = new THREE.Scene();
    this.scene.background = null;

    const canvas = this.canvasRef.nativeElement;

    const width = canvas.clientWidth || Math.floor(window.innerWidth * 0.33);
    const height = canvas.clientHeight || Math.floor(window.innerHeight * 0.9);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(0, 2, 4);
    this.camera.lookAt(0, 2, 1);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear existing canvas content
    while (canvas.firstChild) {
      canvas.removeChild(canvas.firstChild);
    }
    canvas.appendChild(this.renderer.domElement);

    // Brighter, more even lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    // Hemisphere provides soft sky/ground fill
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    this.scene.add(hemi);

    // Directional key light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(3, 7, 3);
    directionalLight.castShadow = false;
    this.scene.add(directionalLight);

    // Small front fill to brighten face
    const frontFill = new THREE.PointLight(0xffffff, 0.7);
    frontFill.position.set(0, 1.8, 2.5);
    this.scene.add(frontFill);

    // Add mouse controls
    this.setupMouseControls();

    const handleResize = () => this.onWindowResize();
    window.addEventListener('resize', handleResize);
    this.removeEventListeners.push(() => window.removeEventListener('resize', handleResize));
  }

  private setupMouseControls(): void {
    const canvasElement = this.renderer.domElement;

    if (!canvasElement) {
      console.warn('Canvas element not found for mouse controls');
      return;
    }

    // Mouse down - start dragging
    const handleMouseDown = () => {
      this.isDragging = true;
    };
    canvasElement.addEventListener('mousedown', handleMouseDown);
    this.removeEventListeners.push(() => canvasElement.removeEventListener('mousedown', handleMouseDown));

    // Mouse move - update rotation when dragging
    const handleMouseMove = (event: MouseEvent) => {
      if (!this.isDragging) return;

      const rect = canvasElement.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      this.targetRotationY = (x - 0.5) * Math.PI * 1.5; // Rotate around Y axis
      this.targetRotationX = (y - 0.5) * Math.PI * 0.5; // Rotate around X axis
    };
    canvasElement.addEventListener('mousemove', handleMouseMove);
    this.removeEventListeners.push(() => canvasElement.removeEventListener('mousemove', handleMouseMove));

    // Mouse up - stop dragging
    const handleMouseUp = () => {
      this.isDragging = false;
      // Smoothly return to neutral position
      this.targetRotationX = 0;
      this.targetRotationY = 0;
    };
    document.addEventListener('mouseup', handleMouseUp);
    this.removeEventListeners.push(() => document.removeEventListener('mouseup', handleMouseUp));

    // Reset rotation when mouse leaves canvas
    const handleMouseLeave = () => {
      this.isDragging = false;
      this.targetRotationX = 0;
      this.targetRotationY = 0;
    };
    canvasElement.addEventListener('mouseleave', handleMouseLeave);
    this.removeEventListeners.push(() => canvasElement.removeEventListener('mouseleave', handleMouseLeave));
  }

  private loadAvatar(): void {
    const loader = new GLTFLoader();
    const modelPath = '/model/riggedboy.glb';

    loader.load(
      modelPath,
      (gltf) => {
        this.model = gltf.scene;
        // Scale up significantly for better visibility in modal
        this.model.scale.set(3.5, 3.5, 3.5);
        // Position lower so head is in camera frame (scaled model needs adjustment)
        this.model.position.set(-0.6, -1.8, 0);
        this.scene.add(this.model);
        this.inspectMorphTargets();
        this.applyEmotion('NEUTRAL');
        this.startBlinking(); // Start eye blinks!

        // If the GLTF carries animation clips, register them and play waving.001 by default.
        if (gltf.animations && gltf.animations.length) {
          try {
            this.animationService.initMixer(this.model);
            this.animationService.loadClipsDirectly(gltf.animations as THREE.AnimationClip[]);
            const available = this.animationService.getAvailableAnimations();
            this.defaultAnimationName = this.pickDefaultAnimation(available);
            this.speakingAnimationName = this.pickSpeakingAnimation(available, this.defaultAnimationName);

            if (this.defaultAnimationName) {
              this.animationService.playAnimation(this.defaultAnimationName);
            } else {
              // Fallback to bone-based wave if no clips
              this.startWavingOnce();
            }
          } catch (err) {
            console.warn('Animation setup failed, falling back to bone-wave', err);
            this.startWavingOnce();
          }
        } else {
          // No animations present in GLTF: fallback
          this.startWavingOnce();
        }
      },
      (progress) => {
        void progress;
      },
      (error) => {
        console.error('Error loading avatar:', error);
        console.error('Model path was:', modelPath);
      },
    );
  }

  private inspectMorphTargets(): void {
    this.model.traverse((node: any) => {
      if (node.morphTargetInfluences) {
        this.morphTargets = node.morphTargetDictionary || {};
      }
    });
  }

  private applyEmotion(emotion: EmotionType): void {
    if (!this.model) {
      console.warn('⚠️ Model not loaded yet');
      return;
    }

    this.resetMorphs();

    // ARKit / standard face blendshapes from the model.
    switch (emotion) {
      case 'HAPPY':
        this.applyMorphTargets({
          mouthSmileLeft: 0.65,
          mouthSmileRight: 0.65,
          cheekSquintLeft: 0.15,
          cheekSquintRight: 0.15,
          eyeSquintLeft: 0.08,
          eyeSquintRight: 0.08,
        });
        break;

      case 'SAD':
        this.applyMorphTargets({
          mouthFrownLeft: 0.55,
          mouthFrownRight: 0.55,
          browInnerUp: 0.2,
          mouthLowerDownLeft: 0.15,
          mouthLowerDownRight: 0.15,
        });
        break;

      case 'CONFUSED':
        this.applyMorphTargets({
          browInnerUp: 0.3,
          browDownLeft: 0.2,
          browDownRight: 0.2,
          mouthPressLeft: 0.15,
          mouthPressRight: 0.15,
          jawForward: 0.05,
        });
        break;

      case 'EXCITED':
        this.applyMorphTargets({
          mouthSmileLeft: 0.7,
          mouthSmileRight: 0.7,
          jawOpen: 0.12,
          browOuterUpLeft: 0.2,
          browOuterUpRight: 0.2,
        });
        break;

      case 'THINKING':
        this.applyMorphTargets({
          browDownLeft: 0.22,
          browDownRight: 0.22,
          browInnerUp: 0.15,
          mouthClose: 0.2,
          mouthPressLeft: 0.1,
          mouthPressRight: 0.1,
        });
        break;

      case 'NEUTRAL':
      default:
        // Reset all morphs, keep neutral
        break;
    }
  }

  private morphInfluence(morphName: string, value: number): void {
    let found = false;

    this.model.traverse((node: any) => {
      if (node.morphTargetInfluences && node.morphTargetDictionary) {
        const morphIndex = node.morphTargetDictionary[morphName];

        if (morphIndex !== undefined) {
          // Silently apply (don't log every morph)
          node.morphTargetInfluences[morphIndex] = value;
          found = true;
        }
      }
    });

    // Only warn if it's an emotion/intentional morph, not a viseme
    if (!found && !/^(mouth|jaw|eye|brow|cheek|nose|tongue|lip)/i.test(morphName)) {
      console.warn(`⚠️ Morph target "${morphName}" not found in any node`);
    }
  }

  private resetMorphs(): void {
    this.model.traverse((node: any) => {
      if (node.morphTargetInfluences) {
        for (let i = 0; i < node.morphTargetInfluences.length; i++) {
          node.morphTargetInfluences[i] = 0;
        }
      }
    });
  }

  /** Map incoming viseme (string) to a morph target and apply it briefly */
  private applyVisemeToMorph(viseme: string): void {
    if (!this.model) return;

    const v = (viseme || '').toUpperCase().trim();
    if (!v) return;

    const targets = this.getVisemeTargets(v);

    if (!Object.keys(targets).length) {
      return;
    }

    if (this.visemeResetTimer) {
      clearTimeout(this.visemeResetTimer);
      this.visemeResetTimer = null;
    }

    this.resetMouthMorphs();

    Object.entries(targets).forEach(([name, value]) => {
      this.morphInfluence(name, value);
    });

    this.visemeResetTimer = setTimeout(() => {
      Object.keys(targets).forEach((name) => this.morphInfluence(name, 0));
      this.visemeResetTimer = null;
    }, 180);

  }

  /**
   * 👀 Eye Blinking Animation
   * Makes the avatar blink naturally every 3-5 seconds
   * Each blink lasts ~150ms (opens and closes eyes)
   */
  private startBlinking(): void {
    // Clear any existing blink timer
    if (this.blinkInterval) {
      clearInterval(this.blinkInterval);
    }

    // Blink every 3-5 seconds (random)
    this.blinkInterval = setInterval(
      () => {
        this.performBlink();
      },
      Math.random() * 2000 + 3000,
    ); // 3000-5000ms
  }

  /**
   * 👁️ Perform a single blink animation
   * Step 1: Close eyes (0ms to 75ms) - gradually increase blink value
   * Step 2: Keep closed (75ms to 100ms)
   * Step 3: Open eyes (100ms to 150ms) - gradually decrease blink value
   */
  public performBlink(): void {
    const blinkDuration = 150; // milliseconds
    const closeDuration = 75;
    const startTime = Date.now();

    const blinkTick = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / blinkDuration;

      if (progress < closeDuration / blinkDuration) {
        // Closing eyes (0 to 1)
        const closeProgress = progress / (closeDuration / blinkDuration);
        this.morphInfluence('eyeBlinkLeft', closeProgress);
        this.morphInfluence('eyeBlinkRight', closeProgress);
      } else if (progress < 1) {
        // Opening eyes (1 to 0)
        const openProgress =
          1 -
          (progress - closeDuration / blinkDuration) /
            ((blinkDuration - closeDuration) / blinkDuration);
        this.morphInfluence('eyeBlinkLeft', openProgress);
        this.morphInfluence('eyeBlinkRight', openProgress);
      } else {
        // Blink complete
        this.morphInfluence('eyeBlinkLeft', 0);
        this.morphInfluence('eyeBlinkRight', 0);
        return;
      }

      requestAnimationFrame(blinkTick);
    };

    requestAnimationFrame(blinkTick);
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();

    // Update animation mixer if available
    this.animationService.update(delta);

    // Smooth rotation interpolation
    if (this.model) {
      this.model.rotation.y +=
        (this.targetRotationY - this.model.rotation.y) * 0.1;
      this.model.rotation.x +=
        (this.targetRotationX - this.model.rotation.x) * 0.1;

      if (this.isSpeaking && !this.speakingAnimationName) {
        const nod = Math.sin(Date.now() * 0.012) * 0.04;
        this.model.rotation.z += (nod - this.model.rotation.z) * 0.08;
      } else {
        this.model.rotation.z += (0 - this.model.rotation.z) * 0.08;
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth || Math.floor(window.innerWidth * 0.33);
    const height = canvas.clientHeight || Math.floor(window.innerHeight * 0.9);

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  openProduct(product: Product): void {
    const urlTree = this.router.createUrlTree(['/product-detail', product.id]);
    const url = this.router.serializeUrl(urlTree);
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  /**
   * Try to find a left-arm bone and perform a short waving animation once.
   * This is best-effort: if no suitable bone is found, the function exits quietly.
   */
  private startWavingOnce(): void {
    if (!this.model) return;

    // Find a likely left-arm/shoulder bone by name or bone type
    let candidate: any = null;
    this.model.traverse((node: any) => {
      if (candidate) return;
      const name = (node.name || '').toLowerCase();
      const isBone = node.type === 'Bone' || node.isBone;

      if (
        isBone &&
        (name.includes('left') || name.includes('l_') || name.includes('.l') || name.includes('l')) &&
        (name.includes('arm') || name.includes('shoulder') || name.includes('upper'))
      ) {
        candidate = node;
      }
    });

    if (!candidate) {
      console.warn('👋 No arm bone found for waving animation (skipping).');
      return;
    }

    this.waveBone = candidate;
    const origX = this.waveBone.rotation.x || 0;
    const origY = this.waveBone.rotation.y || 0;
    const origZ = this.waveBone.rotation.z || 0;

    const start = Date.now();
    const duration = 1600; // ms
    const strokes = 3; // back-and-forth strokes

    const tick = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);

      // smooth sinusoidal stroke pattern
      const angle = Math.sin(t * Math.PI * strokes) * 0.5 * (1 - t);

      // Apply a subtle rotation around Z (adjust axis if needed for model)
      this.waveBone.rotation.z = origZ + angle * 0.6;

      if (t < 1) {
        this.waveAnimationId = requestAnimationFrame(tick);
      } else {
        // restore
        this.waveBone.rotation.x = origX;
        this.waveBone.rotation.y = origY;
        this.waveBone.rotation.z = origZ;
        if (this.waveAnimationId) cancelAnimationFrame(this.waveAnimationId);
        this.waveAnimationId = null;
      }
    };

    requestAnimationFrame(tick);
  }

  private pickDefaultAnimation(available: string[]): string | null {
    if (!available.length) return null;

    return (
      available.find((name) => /wave|waving/i.test(name)) ??
      available.find((name) => /idle|breath|stand|pose/i.test(name)) ??
      available[0] ??
      null
    );
  }

  private pickSpeakingAnimation(available: string[], defaultAnimation: string | null): string | null {
    const preferred = available.find((name) =>
      /talk|speak|chat|mouth|listen|idle|breath/i.test(name) && name !== defaultAnimation,
    );

    if (preferred) return preferred;

    return available.find((name) => name !== defaultAnimation && !/wave|waving/i.test(name)) ?? null;
  }

  private startSpeakingAnimation(): void {
    this.isSpeaking = true;

    if (this.speakingAnimationName) {
      this.animationService.playAnimation(this.speakingAnimationName);
      return;
    }

    this.animationService.stopAnimation();
  }

  private stopSpeakingAnimation(): void {
    this.isSpeaking = false;

    if (this.model) {
      this.model.rotation.z = 0;
    }

    if (this.defaultAnimationName) {
      this.animationService.playAnimation(this.defaultAnimationName);
    }
  }

  private resetMouthMorphs(): void {
    const mouthTargets = [
      'mouthClose', 'mouthFunnel', 'mouthPucker', 'mouthRight', 'mouthLeft',
      'mouthSmileLeft', 'mouthSmileRight', 'mouthFrownRight', 'mouthFrownLeft',
      'mouthDimpleLeft', 'mouthDimpleRight', 'mouthStretchLeft', 'mouthStretchRight',
      'mouthRollLower', 'mouthRollUpper', 'mouthPressLeft', 'mouthPressRight',
      'mouthLowerDownLeft', 'mouthLowerDownRight', 'mouthUpperUpLeft', 'mouthUpperUpRight',
      'jawForward', 'jawLeft', 'jawRight', 'jawOpen', 'mouthShrugLower', 'mouthShrugUpper',
      'tongueOut',
    ];

    mouthTargets.forEach((name) => this.morphInfluence(name, 0));
  }

  private getVisemeTargets(viseme: string): Record<string, number> {
    const map: Record<string, Record<string, number>> = {
      X: { mouthClose: 1, jawOpen: 0.02 },
      A: { jawOpen: 0.65, mouthLowerDownLeft: 0.12, mouthLowerDownRight: 0.12 },
      B: { mouthClose: 1, mouthPressLeft: 0.35, mouthPressRight: 0.35 },
      C: { mouthFunnel: 0.7, mouthPucker: 0.45 },
      D: { mouthFunnel: 0.55, jawOpen: 0.18 },
      E: { mouthSmileLeft: 0.28, mouthSmileRight: 0.28, mouthStretchLeft: 0.24, mouthStretchRight: 0.24 },
      F: { mouthFunnel: 0.45, mouthPucker: 0.35 },
      G: { mouthPressLeft: 0.2, mouthPressRight: 0.2, jawOpen: 0.12 },
      H: { mouthStretchLeft: 0.35, mouthStretchRight: 0.35, jawOpen: 0.08 },
      I: { mouthSmileLeft: 0.3, mouthSmileRight: 0.3, mouthStretchLeft: 0.2, mouthStretchRight: 0.2 },
      O: { mouthFunnel: 0.75, mouthPucker: 0.6 },
      U: { mouthPucker: 0.78, mouthFunnel: 0.25 },
      Y: { mouthStretchLeft: 0.34, mouthStretchRight: 0.34, jawOpen: 0.1 },
      Q: { mouthFunnel: 0.7, mouthPucker: 0.55 },
      Z: { mouthPressLeft: 0.24, mouthPressRight: 0.24, mouthStretchLeft: 0.12, mouthStretchRight: 0.12 },
    };

    return map[viseme] ?? map['X'];
  }

  private applyMorphTargets(targets: Record<string, number>): void {
    Object.entries(targets).forEach(([name, value]) => this.morphInfluence(name, value));
  }
}
