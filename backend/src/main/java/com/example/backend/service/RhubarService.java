package com.example.backend.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class RhubarService {

	private final ObjectMapper objectMapper;

	@Value("${avatar.ffmpeg.executable:ffmpeg}")
	private String ffmpegExecutable;

	@Value("${avatar.rhubarb.executable:rhubarb}")
	private String rhubarbExecutable;

	@Value("${avatar.audio-temp-dir:target/generated-avatar-audio}")
	private String audioTempDir;

	public RhubarService(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	public List<VisemeData> extractVisemes(Path audioFile) {
		if (audioFile == null) {
			return List.of();
		}

		Path wavFile = null;
		Path jsonFile = null;

		try {
			Path workingDirectory = Path.of(audioTempDir);
			Files.createDirectories(workingDirectory);

			wavFile = Files.createTempFile(workingDirectory, "rhubarb-", ".wav");
			jsonFile = Files.createTempFile(workingDirectory, "rhubarb-", ".json");

			convertToWav(audioFile, wavFile);
			runCommand(List.of(
					rhubarbExecutable,
					"-f", "json",
					"-o", jsonFile.toString(),
					wavFile.toString()
			));

			RhubarbOutput output = objectMapper.readValue(jsonFile.toFile(), RhubarbOutput.class);
			if (output == null || output.mouthCues == null) {
				return List.of();
			}

			List<VisemeData> visemes = new ArrayList<>();
			for (MouthCue cue : output.mouthCues) {
				visemes.add(new VisemeData((float) cue.start, (float) cue.end, cue.value));
			}
			return visemes;
		} catch (Exception e) {
			log.error("Error generating visemes", e);
			throw new RuntimeException("Failed to extract visemes", e);
		} finally {
			deleteQuietly(jsonFile);
			deleteQuietly(wavFile);
		}
	}

	private void convertToWav(Path sourceAudio, Path targetWav) throws Exception {
		runCommand(List.of(
				ffmpegExecutable,
				"-y",
				"-i", sourceAudio.toString(),
				"-ar", "16000",
				"-ac", "1",
				targetWav.toString()
		));
	}

	private String runCommand(List<String> command) throws Exception {
		ProcessBuilder processBuilder = new ProcessBuilder(command);
		processBuilder.redirectErrorStream(true);

		Process process = processBuilder.start();
		boolean finished = process.waitFor(2, TimeUnit.MINUTES);
		if (!finished) {
			process.destroyForcibly();
			throw new IllegalStateException("Command timed out: " + String.join(" ", command));
		}

		String output;
		try (InputStream inputStream = process.getInputStream()) {
			output = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
		}

		if (process.exitValue() != 0) {
			throw new IllegalStateException("Command failed: " + String.join(" ", command) + "\n" + output);
		}

		return output;
	}

	private void deleteQuietly(Path path) {
		if (path == null) {
			return;
		}

		try {
			Files.deleteIfExists(path);
		} catch (Exception ignored) {
			// Best effort cleanup.
		}
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private static class RhubarbOutput {
		public List<MouthCue> mouthCues;
	}

	@JsonIgnoreProperties(ignoreUnknown = true)
	private static class MouthCue {
		public double start;
		public double end;
		public String value;
	}
}
