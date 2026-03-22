package com.animalfarm.backend.global.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PagedResponseDTO<T> {
	private List<T> items;
	private int page;
	private int size;
	private long total;
	private boolean hasNext;
}