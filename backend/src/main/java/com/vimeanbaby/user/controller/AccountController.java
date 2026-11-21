package com.vimeanbaby.user.controller;

import com.vimeanbaby.common.ApiResponse;
import com.vimeanbaby.exception.BadRequestException;
import com.vimeanbaby.media.dto.MediaUploadResponse;
import com.vimeanbaby.media.service.CloudinaryService;
import com.vimeanbaby.security.AuthUser;
import com.vimeanbaby.user.dto.AccountDtos.ChangePasswordRequest;
import com.vimeanbaby.user.dto.AccountDtos.UpdateProfileRequest;
import com.vimeanbaby.user.dto.AuthDtos.AuthResponse;
import com.vimeanbaby.user.dto.UserProfileResponse;
import com.vimeanbaby.user.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/me")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;
    private final CloudinaryService cloudinaryService;

    @GetMapping
    public ApiResponse<UserProfileResponse> me(@AuthenticationPrincipal AuthUser user) {
        return ApiResponse.ok(accountService.getProfile(user.id()));
    }

    @PutMapping
    public ApiResponse<UserProfileResponse> update(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ApiResponse.ok(accountService.updateProfile(user.id(), request), "Profile updated");
    }

    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserProfileResponse> uploadAvatar(
            @AuthenticationPrincipal AuthUser user,
            @RequestParam("file") MultipartFile file
    ) {
        if (file.isEmpty()) {
            throw new BadRequestException("Please select an image file", "EMPTY_FILE");
        }
        String url;
        try {
            MediaUploadResponse uploaded = cloudinaryService.upload(file, "vimeanbaby/avatars");
            url = uploaded.secureUrl() != null && !uploaded.secureUrl().isBlank() ? uploaded.secureUrl() : uploaded.url();
        } catch (Exception e) {
            try {
                String base64 = java.util.Base64.getEncoder().encodeToString(file.getBytes());
                String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";
                url = "data:" + contentType + ";base64," + base64;
            } catch (Exception ex) {
                throw new BadRequestException("Failed to process image file", "UPLOAD_FAILED");
            }
        }
        return ApiResponse.ok(accountService.updateAvatar(user.id(), url), "Avatar updated");
    }

    @PutMapping("/password")
    public ApiResponse<AuthResponse> changePassword(
            @AuthenticationPrincipal AuthUser user,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        return ApiResponse.ok(accountService.changePassword(user.id(), request), "Password changed");
    }

    @PostMapping("/logout-all")
    public ApiResponse<Void> logoutAll(@AuthenticationPrincipal AuthUser user) {
        accountService.logoutEverywhere(user.id());
        return ApiResponse.ok(null, "Signed out of all devices");
    }
}
