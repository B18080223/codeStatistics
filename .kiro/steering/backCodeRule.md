# 后端编码规范

Java Spring Boot 编码规范

## 技术栈

- Java 8
- Spring Boot 2.7.x
- Maven

## 命名规范

### 包命名

- 全小写，使用域名倒序：`com.example.module`
- 按功能分层：`controller`、`service`、`repository`、`model`、`dto`、`config`

### 类命名

- PascalCase
- Controller：`XxxController`
- Service 接口：`XxxService`
- Service 实现：`XxxServiceImpl`
- Repository：`XxxRepository`
- 实体类：`Xxx`
- DTO：`XxxDTO` 或 `XxxRequest`/`XxxResponse`

### 方法命名

- camelCase
- 查询：`getXxx`、`findXxx`、`listXxx`
- 创建：`createXxx`、`addXxx`
- 更新：`updateXxx`、`modifyXxx`
- 删除：`deleteXxx`、`removeXxx`
- 判断：`isXxx`、`hasXxx`、`canXxx`

### 变量命名

- camelCase
- 常量：UPPER_SNAKE_CASE
- 布尔变量避免 `is` 前缀（与 JavaBean 规范冲突）

## 代码格式

- 缩进：4 个空格
- 行宽：120 字符
- 大括号：同行风格（K&R）
- 空行：方法之间一个空行

## Controller 规范

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getById(id));
    }

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userService.create(request));
    }
}
```

### 要点

- 使用 `@RestController`
- URL 使用复数名词：`/api/users`
- 使用合适的 HTTP 方法：GET/POST/PUT/DELETE
- 使用 `@Valid` 验证请求参数
- 返回 `ResponseEntity` 控制状态码

## Service 规范

```java
public interface UserService {
    UserDTO getById(Long id);
    UserDTO create(CreateUserRequest request);
}

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDTO getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return convertToDTO(user);
    }

    @Override
    @Transactional
    public UserDTO create(CreateUserRequest request) {
        // 业务逻辑
    }
}
```

### 要点

- 接口与实现分离
- 使用 `@Transactional` 管理事务
- 只读操作加 `readOnly = true`
- 抛出有意义的异常

## 异常处理

### 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(ResourceNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Internal server error"));
    }
}
```

### 自定义异常

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

## 日志规范

```java
@Slf4j
@Service
public class UserServiceImpl implements UserService {

    public UserDTO getById(Long id) {
        log.info("Getting user by id: {}", id);
        // ...
        log.debug("User found: {}", user);
    }
}
```

### 日志级别

- ERROR：系统错误，需要立即处理
- WARN：警告，可能的问题
- INFO：重要业务流程
- DEBUG：调试信息

## 注释规范

### 类注释

```java
/**
 * 用户服务实现类
 *
 * @author [name]
 * @since 1.0.0
 */
@Service
public class UserServiceImpl {
}
```

### 方法注释

```java
/**
 * 根据ID获取用户
 *
 * @param id 用户ID
 * @return 用户信息
 * @throws ResourceNotFoundException 用户不存在时抛出
 */
public UserDTO getById(Long id) {
}
```

## 最佳实践

1. 依赖注入优先使用构造器注入
2. 避免在循环中进行数据库操作
3. 使用 Optional 处理可能为空的值
4. DTO 与实体类分离
5. 敏感信息不要写入日志

## 禁止事项

1. 禁止在 Controller 中写业务逻辑
2. 禁止捕获异常后不处理
3. 禁止使用 `System.out.println`
4. 禁止硬编码配置值
5. 禁止在实体类中使用 Lombok 的 `@Data`（推荐 `@Getter` `@Setter`）
