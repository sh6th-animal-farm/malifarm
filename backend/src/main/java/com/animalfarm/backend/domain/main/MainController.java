package com.animalfarm.backend.domain.main;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MainController {
	@GetMapping("/api/main")
	public String getMainPage() {
		return "Main Page";
	}
}
