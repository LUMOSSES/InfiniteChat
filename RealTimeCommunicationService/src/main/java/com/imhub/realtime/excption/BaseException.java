package com.imhub.realtime.excption;
public class BaseException extends RuntimeException{
    public BaseException(){}

    public BaseException(String msg){
        super(msg);
    }
}