package com.animalfarm.backend.domain.user.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.animalfarm.backend.domain.user.dto.UserDTO;

@Mapper
public interface UserRepository {

	UserDTO findByEmail(String email);

	int insertUser(UserDTO user);

	boolean existsByEmail(String email);

	String selectAddress(Long userId);

	int updateAddress(@Param("address")
	String address, @Param("userId")
	Long userId);

	UserDTO getUserById(Long userId);

	Long selectUserIdByUclId(Long walletId);

	String selectUserNameById(@Param("userId")
	Long userId);

	String selectUserRoleById(Long userId);
}
