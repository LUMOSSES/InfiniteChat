package com.imhub.moment.controller;

import com.imhub.moment.common.Result;
import com.imhub.moment.data.createComment.CreateCommentRequest;
import com.imhub.moment.data.createComment.CreateCommentResponse;
import com.imhub.moment.data.createComment.MomentCommentDTO;
import com.imhub.moment.data.createComment.MomentCommentVO;
import com.imhub.moment.data.createLike.CreateLikeRequest;
import com.imhub.moment.data.createLike.CreateLikeResponse;
import com.imhub.moment.data.createMoment.CreateMomentRequest;
import com.imhub.moment.data.createMoment.CreateMomentResponse;
import com.imhub.moment.data.deleteComment.DeleteCommentRequest;
import com.imhub.moment.data.deleteComment.DeleteCommentResponse;
import com.imhub.moment.data.deleteLike.DeleteLikeRequest;
import com.imhub.moment.data.deleteLike.DeleteLikeResponse;
import com.imhub.moment.data.deleteLike.UnlikeMomentRequest;
import com.imhub.moment.data.deleteMoment.DeleteMomentRequest;
import com.imhub.moment.data.deleteMoment.DeleteMomentResponse;
import com.imhub.moment.data.getMomentList.MomentListVO;
import com.imhub.moment.service.MomentCommentService;
import com.imhub.moment.service.MomentLikeService;
import com.imhub.moment.service.MomentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/moment")
@RequiredArgsConstructor
public class MomentController {
    @Autowired
    private MomentService momentService;

    @Autowired
    private MomentLikeService momentLikeService;

    @Autowired
    private MomentCommentService momentCommentService;

    @GetMapping("/list")
    public Result<List<MomentListVO>> getMomentList(
            @NotNull(message = "用户ID不能为空") @RequestParam Long userId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "10") Integer size) {
        List<MomentListVO> response = momentService.getMomentList(userId, page, size);
        return Result.OK(response);
    }

    @PostMapping("")
    public Result<CreateMomentResponse> createMoment(@Valid @RequestBody CreateMomentRequest request) throws Exception {
        CreateMomentResponse response = momentService.createMoment(request);

        return Result.OK(response);
    }

    @DeleteMapping("/{momentId}")
    public Result<DeleteMomentResponse> deleteMoment(@Valid @ModelAttribute DeleteMomentRequest request) {
        DeleteMomentResponse response = momentService.deleteMoment(request);

       return Result.OK(response);
    }

    @PostMapping("/like/{momentId}")
    public Result<CreateLikeResponse> likeMoment(@PathVariable Long momentId, @Valid @RequestBody CreateLikeRequest request) throws Exception {
        CreateLikeResponse response = momentLikeService.likeMomentResponse(momentId, request);

        return Result.OK(response);
    }

    @DeleteMapping("/like/{momentId}")
    public Result<DeleteLikeResponse> deleteLikeMoment(@Valid @ModelAttribute DeleteLikeRequest request) {
        DeleteLikeResponse response = momentLikeService.deleteLikeMoment(request);

        return Result.OK(response);
    }

    @PostMapping("/{momentId}/like")
    public Result<?> likeMomentByPath(@PathVariable Long momentId, @Valid @RequestBody UnlikeMomentRequest request) throws Exception {
        CreateLikeResponse response = momentLikeService.likeMomentResponse(momentId,
                new CreateLikeRequest().setUserId(request.getUserId()));
        return Result.OK(response);
    }

    @DeleteMapping("/{momentId}/like")
    public Result<?> unlikeMomentByPath(@PathVariable Long momentId, @Valid @RequestBody UnlikeMomentRequest request) {
        momentLikeService.unlikeMoment(momentId, request.getUserId());
        return Result.OK(null);
    }

    @PostMapping("/comment/{momentId}")
    public Result<CreateCommentResponse> createMoment(
            @NotNull(message = "朋友圈 ID 不能为空") @PathVariable("momentId") Long momentId,
            @Valid @RequestBody MomentCommentDTO momentCommentDTO) throws Exception {
        CreateCommentRequest request = new CreateCommentRequest()
                .setMomentId(momentId)
                .setMomentCommentDTO(momentCommentDTO);


        CreateCommentResponse response = momentCommentService.createComment(request);

        return Result.OK(response);
    }

    @DeleteMapping("/comment/{momentId}")
    public Result<DeleteCommentResponse> deleteComment(@Valid @ModelAttribute DeleteCommentRequest request) {
        DeleteCommentResponse response = momentCommentService.deleteComment(request);

        return Result.OK(response);
    }

    @GetMapping("/{momentId}/comment/list")
    public Result<List<MomentCommentVO>> getCommentList(
            @PathVariable Long momentId,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer size) {
        List<MomentCommentVO> response = momentCommentService.getCommentList(momentId, page, size);
        return Result.OK(response);
    }

}