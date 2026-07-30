package com.threadora.messaging.controller;

import com.threadora.messaging.common.Result;
import com.threadora.messaging.data.sendMsg.SendMsgRequest;
import com.threadora.messaging.data.sendMsg.SendMsgResponse;
import com.threadora.messaging.feign.ContactServiceFeign;
import com.threadora.messaging.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SendMsgController {
    @Autowired
    private ContactServiceFeign contactServiceFeign;

    @Autowired
    private MessageService messageService;


    @GetMapping("/feign")
    public Result<?> getUser() {

        Result<?> user = contactServiceFeign.getUser();

        return Result.OK(user);
    }

    @PostMapping("/v1/chat/session")
    public Result<SendMsgResponse> sendMsg(@RequestBody SendMsgRequest request) throws Exception {
        SendMsgResponse response = messageService.sendMessage(request);

        return Result.OK(response);
    }


}