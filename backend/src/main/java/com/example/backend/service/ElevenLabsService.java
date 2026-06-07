package com.example.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@Slf4j
public class ElevenLabsService {

	private final HttpClient httpClient;
	private final ObjectMapper objectMapper;

	@Value("${avatar.elevenlabs.api-key:${ELEVENLABS_API_KEY:}}")
	private String apiKey;

	@Value("${avatar.elevenlabs.voice-id:${ELEVENLABS_VOICE_ID:}}")
	private String voiceId;

	@Value("${avatar.elevenlabs.model-id:eleven_multilingual_v2}")
	private String modelId;

	@Value("${avatar.elevenlabs.output-dir:target/generated-avatar-audio}")
	private String outputDir;

	public ElevenLabsService(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
		this.httpClient = HttpClient.newBuilder()
				.connectTimeout(Duration.ofSeconds(30))
				.build();
	}

	public Path synthesizeSpeech(String text) {
		if (text == null || text.isBlank()) {
			throw new IllegalArgumentException("Text for speech synthesis cannot be blank");
		}

		if (apiKey == null || apiKey.isBlank()) {
			throw new IllegalStateException("ELEVENLABS_API_KEY is missing");
		}

		if (voiceId == null || voiceId.isBlank()) {
			throw new IllegalStateException("ELEVENLABS_VOICE_ID is missing");
		}

		try {
			Path outputDirectory = Path.of(outputDir);
			Files.createDirectories(outputDirectory);
			Path outputFile = Files.createTempFile(outputDirectory, "elevenlabs-", ".mp3");

			Map<String, Object> body = new LinkedHashMap<>();
			body.put("text", text);
			body.put("model_id", modelId);
			body.put("voice_settings", Map.of(
					"stability", 0.5,
					"similarity_boost", 0.75,
					"style", 0.0,
					"use_speaker_boost", true
			));

			HttpRequest request = HttpRequest.newBuilder()
					.uri(URI.create("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId))
					.timeout(Duration.ofSeconds(120))
					.header("xi-api-key", apiKey)
					.header("accept", "audio/mpeg")
					.header("content-type", "application/json")
					.POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body), StandardCharsets.UTF_8))
					.build();

			HttpResponse<InputStream> response = httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
			if (response.statusCode() < 200 || response.statusCode() >= 300) {
				String errorBody = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
				throw new IllegalStateException("ElevenLabs request failed with status " + response.statusCode() + ": " + errorBody);
			}

			try (InputStream audioStream = response.body()) {
				Files.copy(audioStream, outputFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
			}

			return outputFile;
		} catch (Exception e) {
			log.error("Error generating ElevenLabs speech", e);
			throw new RuntimeException("Failed to synthesize speech", e);
		}
	}
}
