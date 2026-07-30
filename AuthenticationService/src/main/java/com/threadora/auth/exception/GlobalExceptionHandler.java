package com.threadora.auth.exception;

import com.threadora.auth.common.Result;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = UserException.class)
    public Result<?> handleUserException(UserException err){
        log.error("user error: {}", err.getMessage());
        return Result.UserError(err.getCode(), err.getMessage());
    }

    @ExceptionHandler(value = CodeException.class)
    public Result<?> handleCodeException(CodeException err){
        log.error("code error: {}", err.getMessage());
        return Result.UserError(err.getCode(), err.getMessage());
    }

    @ExceptionHandler(value = DatabaseException.class)
    public Result<?> handleDatabaseException(DatabaseException err){
        log.error("database error: {}", err.getMessage());
        return Result.DatabaseError(err.getMessage());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public Result<?> handleValidException(MethodArgumentNotValidException e){
        BindingResult bindingResult = e.getBindingResult();
        Map<String, String> errorMap = new HashMap<>();
        bindingResult.getFieldErrors().forEach(fieldError ->
                errorMap.put(fieldError.getField(), fieldError.getDefaultMessage()));
        log.error("validation error: {}, details: {}", e.getMessage(), errorMap);
        return Result.ValidError(errorMap.toString());
    }

    @ExceptionHandler(value = Throwable.class)
    public Result<?> handleException(Throwable err){
        log.error("unknown error", err);
        return Result.ServerError(err.getMessage());
    }
}
