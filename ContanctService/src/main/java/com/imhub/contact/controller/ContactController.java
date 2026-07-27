package com.imhub.contact.controller;

import com.imhub.contact.common.Result;
import com.imhub.contact.data.AddFriend.AddFriendRequest;
import com.imhub.contact.data.AddFriend.AddFriendResponse;
import com.imhub.contact.data.AddFriend.FriendApplyActionRequest;
import com.imhub.contact.data.AddFriend.FriendApplyRequest;
import com.imhub.contact.data.ApplyList.ApplyListRequest;
import com.imhub.contact.data.ApplyList.ApplyListResponse;
import com.imhub.contact.data.ApplyList.FriendApplicationDTO;
import com.imhub.contact.data.BlockFriend.BlockFriendRequest;
import com.imhub.contact.data.BlockFriend.BlockFriendResponse;
import com.imhub.contact.data.CreateGroup.CreateGroupRequest;
import com.imhub.contact.data.CreateGroup.CreateGroupResponse;
import com.imhub.contact.data.DeleteFriend.DeleteFriendRequest;
import com.imhub.contact.data.DeleteFriend.DeleteFriendResponse;
import com.imhub.contact.data.ExitGroup.ExitGroupRequest;
import com.imhub.contact.data.ExitGroup.ExitGroupResponse;
import com.imhub.contact.data.FriendDetail.FriendDetailRequest;
import com.imhub.contact.data.FriendDetail.FriendDetailResponse;
import com.imhub.contact.data.GetGroupMembers.GroupMembersRequest;
import com.imhub.contact.data.GetGroupMembers.GroupMembersResponse;
import com.imhub.contact.data.InviteGroup.InviteGroupRequest;
import com.imhub.contact.data.InviteGroup.InviteGroupResponse;
import com.imhub.contact.data.KickGroup.KickGroupMembersRequest;
import com.imhub.contact.data.KickGroup.KickGroupMembersResponse;
import com.imhub.contact.data.ModifyApply.ModifyApplyRequest;
import com.imhub.contact.data.ModifyApply.ModifyApplyResponse;
import com.imhub.contact.data.SearchUser.SearchByKeywordRequest;
import com.imhub.contact.data.SearchUser.SearchUserRequest;
import com.imhub.contact.data.SearchUser.SearchUserResponse;
import com.imhub.contact.data.UnreadApply.UnreadApplyRequest;
import com.imhub.contact.data.UnreadApply.UnreadApplyResponse;
import com.imhub.contact.data.User.UserResponse;
import com.imhub.contact.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/api/v1/contact")
public class ContactController {
    @Autowired
    private FriendService friendService;

    @Autowired
    private ApplyFriendService applyFriendService;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private GroupService groupService;

    @Autowired
    private GetGroupMembersService getGroupMembersService;

    @Autowired
    private KickGroupService kickGroupMembers;

    @Autowired
    private ExitGroupService exitGroupService;

    @GetMapping("/user")//测试接口
    public Result<UserResponse> getUser() {
        UserResponse userResponse = new UserResponse();
        userResponse.setAvatar("www.baidu.com");

        return Result.OK(userResponse);
    }

    @GetMapping("/{userUuid}/user")//根据用户UUID获取用户信息
    public Result<SearchUserResponse> searchUser(@Valid @ModelAttribute SearchUserRequest request){
        SearchUserResponse response = friendService.searchUser(request);

        return Result.OK(response);
    }

    @GetMapping("/search")//根据关键词搜索用户
    public Result<List<SearchUserResponse>> searchByKeyword(@Valid @ModelAttribute SearchByKeywordRequest request){
        List<SearchUserResponse> response = friendService.searchByKeyword(request);

        return Result.OK(response);
    }

    @GetMapping("/friend/list")//获取好友列表
    public Result<List<SearchUserResponse>> getFriendList(@NotNull(message = "用户ID不能为空") @RequestParam String userUuid){
        List<SearchUserResponse> response = friendService.getFriendList(userUuid);

        return Result.OK(response);
    }

    @PostMapping("/{userUuid}/friend/{receiveUserUuid}")
    //添加好友接口，接收一个AddFriendRequest对象，包含发起添加好友请求的用户UUID、被添加好友的UUID以及其他相关信息。
    public Result<AddFriendResponse> addFriend(
            @NotNull(message = "发起人不能为空") @PathVariable("userUuid") String userUuid,
            @NotNull(message = "接受者不能为空") @PathVariable("receiveUserUuid") String receiveUserUuid,
            @RequestBody AddFriendRequest request) throws Exception {


        AddFriendResponse response = applyFriendService.addFriend(userUuid, receiveUserUuid, request);

        return Result.OK(response);
    }

    @PostMapping("/friend/apply")
    public Result<AddFriendResponse> applyFriend(@Valid @RequestBody FriendApplyRequest request) throws Exception {
        AddFriendResponse response = applyFriendService.addFriend(request.getUserUuid(), request.getTargetId(),
                new AddFriendRequest().setMsg(request.getMsg()));
        return Result.OK(response);
    }

    @GetMapping("/friend/apply/list")
    public Result<List<FriendApplicationDTO>> getApplyList(@NotNull(message = "用户ID不能为空") @RequestParam String userUuid) {
        List<FriendApplicationDTO> response = applyFriendService.getApplyList(userUuid);
        return Result.OK(response);
    }

    @PostMapping("/friend/apply/accept")
    public Result<?> acceptApply(@Valid @RequestBody FriendApplyActionRequest request) throws Exception {
        applyFriendService.acceptApply(request.getUserUuid(), request.getApplyId());
        return Result.OK(null);
    }

    @PostMapping("/friend/apply/reject")
    public Result<?> rejectApply(@Valid @RequestBody FriendApplyActionRequest request) {
        applyFriendService.rejectApply(request.getUserUuid(), request.getApplyId());
        return Result.OK(null);
    }

    @GetMapping("/{userUuid}/applyCount")//获取未读好友申请数量接口，接收一个UnreadApplyRequest对象，包含用户UUID。
    public Result<UnreadApplyResponse> getUnreadApplyCount(@Valid @ModelAttribute UnreadApplyRequest request) {
        UnreadApplyResponse response = applyFriendService.getUnreadApply(request);

        return Result.OK(response);
    }

    @GetMapping("/{userUuid}/apply")
    public Result<ApplyListResponse> getApplyList(@Valid @ModelAttribute ApplyListRequest request) {
        ApplyListResponse response = applyFriendService.getApplyList(request);

        return Result.OK(response);
    }

    @PostMapping("/{userUuid}/application/{status}")
    public Result<ModifyApplyResponse> modifyFriendApplicationStatus(@Valid @ModelAttribute ModifyApplyRequest request) throws Exception {
        ModifyApplyResponse response = applyFriendService.modifyApply(request);

        return Result.OK(response);
    }

    @DeleteMapping("/{userUuid}/friend/{receiveUserUuid}")
    public Result<DeleteFriendResponse> deleteFriend(@Valid @ModelAttribute DeleteFriendRequest request) {
        DeleteFriendResponse response = friendService.deleteFriend(request);

        return Result.OK(response);
    }

    @PostMapping("/{userUuid}/block/{receiveUserUuid}")
    public Result<BlockFriendResponse> blockFriend(@Valid @ModelAttribute BlockFriendRequest request) {
        BlockFriendResponse response = friendService.blockFriend(request);

        return Result.OK(response);
    }

    @GetMapping("/{userUuid}/friend/{friendUuid}")
    public Result<FriendDetailResponse> getFriendDetail(@Valid @ModelAttribute FriendDetailRequest request) {
        FriendDetailResponse response = friendService.getFriendDetails(request);

        return Result.OK(response);
    }


    @PostMapping("/groups")
    public Result<CreateGroupResponse> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        CreateGroupResponse response = sessionService.createGroup(request);

        return Result.OK(response);
    }


    @PostMapping("/group/invite")
    public Result<InviteGroupResponse> inviteGroup(@Valid @RequestBody InviteGroupRequest inviteGroupRequest) throws Exception {
        InviteGroupResponse response = groupService.inviteGroup(inviteGroupRequest);

        return Result.OK(response);
    }


    @PostMapping("/group/kick")
    public Result<KickGroupMembersResponse> kickGroupMembers(@Valid @RequestBody KickGroupMembersRequest request) {
        KickGroupMembersResponse response = kickGroupMembers.kickGroupMembers(request);

        return Result.OK(response);
    }


    @PostMapping("/group/exit")
    public Result<ExitGroupResponse> exitGroup(@RequestBody ExitGroupRequest groupExitRequest) {
        ExitGroupResponse response = exitGroupService.exitGroup(groupExitRequest);

        return Result.OK(response);
    }

    @GetMapping("/group/{sessionId}/members")
    public Result<GroupMembersResponse> getGroupMembers(@Valid GroupMembersRequest request) {
        GroupMembersResponse response = getGroupMembersService.getGroupMembers(request);

        return Result.OK(response);
    }
}