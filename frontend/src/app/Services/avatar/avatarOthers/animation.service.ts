import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  private mixer: THREE.AnimationMixer | null = null;
  private clips: Record<string, THREE.AnimationClip> = {};
  private currentAction: THREE.AnimationAction | null = null;

  constructor() {}

  initMixer(model: THREE.Group): THREE.AnimationMixer {
    console.log('🎬 Creating AnimationMixer on model');
    this.mixer = new THREE.AnimationMixer(model);
    return this.mixer;
  }

  logBoneNames(model: THREE.Group): void {
    console.log('\n========== 🦴 SKELETON BONES ==========');
    model.traverse((child) => {
      if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
        const mesh = child as THREE.SkinnedMesh;
        console.log(
          `🔗 SkinnedMesh: "${mesh.name}" | Bones: ${mesh.skeleton.bones.length}`,
        );
        mesh.skeleton.bones.forEach((bone, i) => {
          console.log(`  [${i}] ${bone.name}`);
        });
      }
    });
    console.log('=========================================\n');
  }

  // ✅ Load clips directly from the same GLB — no separate file needed
  loadClipsDirectly(animations: THREE.AnimationClip[]): void {
    animations.forEach((clip) => {
      // Strip only Hips position to prevent vertical drift
      clip.tracks = clip.tracks.filter(
        (track) => track.name !== 'mixamorigHips.position',
      );
      this.clips[clip.name] = clip;
      console.log(
        `📌 Clip ready: "${clip.name}" | ${clip.tracks.length} tracks`,
      );
    });
  }

  playAnimation(animationName: string): void {
    if (!this.mixer) {
      console.warn('⚠️ No animation mixer available');
      return;
    }

    const clip = this.clips[animationName];
    if (!clip) {
      console.warn(`⚠️ Animation "${animationName}" not found`);
      console.warn('Available:', Object.keys(this.clips));
      return;
    }

    if (this.currentAction) {
      this.currentAction.fadeOut(0.3);
    }

    const action = this.mixer.clipAction(clip);
    action.reset();
    action.fadeIn(0.3);
    action.play();

    this.currentAction = action;
    console.log(`✅ Playing: "${animationName}"`);
  }

  stopAnimation(): void {
    if (this.currentAction) {
      this.currentAction.fadeOut(0.3);
    }
  }

  update(deltaTime: number): void {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  getMixer(): THREE.AnimationMixer | null {
    return this.mixer;
  }

  getAvailableAnimations(): string[] {
    return Object.keys(this.clips);
  }

  isPlaying(): boolean {
    return this.currentAction !== null && this.currentAction.isRunning();
  }
}
