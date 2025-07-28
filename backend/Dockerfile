# 构建阶段（使用docker构建因为防止平台不一致）
FROM golang:1.24-alpine AS builder
WORKDIR /app
# 使用阿里云镜像源解决网络问题
RUN echo "http://mirrors.aliyun.com/alpine/v3.22/main" > /etc/apk/repositories && \
    echo "http://mirrors.aliyun.com/alpine/v3.22/community" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache ca-certificates
COPY go.mod go.sum ./
# 使用中国 Go 代理镜像
ENV GOPROXY=https://goproxy.cn,direct
ENV GOSUMDB=off
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main cmd/main.go

# 运行阶段
FROM alpine:latest

## ca：默认alpine无任何证书，依靠go语言内置证书，但是go语言可能比较旧了
## tz：时区数据，alpine默认无时区信息，go给数据发送时区时候，是需要从内部读取时区信息的
RUN echo "http://mirrors.aliyun.com/alpine/v3.22/main" > /etc/apk/repositories && \
    echo "http://mirrors.aliyun.com/alpine/v3.22/community" >> /etc/apk/repositories && \
    apk update && \
    apk --no-cache add ca-certificates tzdata

# 创建非 root 用户
RUN addgroup -g 1001 -S appgroup && \
    adduser -u 1001 -S appuser -G appgroup

WORKDIR /app
COPY --from=builder /app/main .

# 更改所有权
RUN chown -R appuser:appgroup /app

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# 启动应用
CMD ["./main"]