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

	int updateAddress(String address, Long userId);

	int updatePasswordByEmail(@Param("email") String email, @Param("password") String password);

	UserDTO getUserById(Long userId);

	Long selectUserIdByUclId(Long walletId);

	String selectUserNameById(Long userId);

	String selectUserRoleById(Long userId);
}
