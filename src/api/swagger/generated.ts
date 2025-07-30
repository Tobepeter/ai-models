/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AIModel {
  capabilities?: string[];
  description?: string;
  id?: string;
  is_active?: boolean;
  max_tokens?: number;
  name?: string;
  provider?: string;
  type?: string;
}

export interface ChangePasswordRequest {
  /** @minLength 6 */
  new_password: string;
  old_password: string;
}

export interface ChatMessage {
  content?: string;
  created_at?: string;
  model?: string;
  role?: string;
}

export interface ChatRequest {
  message: string;
  model?: string;
  stream?: boolean;
}

export interface ChatResponse {
  created_at?: string;
  id?: string;
  message?: string;
  model?: string;
  usage?: Usage;
}

export interface CreateFeedCommentRequest {
  /**
   * 评论内容，最多500字符
   * @maxLength 500
   */
  content: string;
  /**
   * 回复的用户名
   * @maxLength 100
   */
  reply_to?: string;
}

export interface CreateFeedPostRequest {
  /**
   * 最多2000字符
   * @maxLength 2000
   */
  content?: string;
  /** 图片URL */
  image_url?: string;
}

export interface CrudCreateRequest {
  /** 业务分类，默认为general */
  category?: string;
  data: string;
}

export interface CrudResponse {
  category?: string;
  created_at?: string;
  data?: string;
  id?: number;
  updated_at?: string;
}

export interface CrudUpdateRequest {
  /** 业务分类 */
  category?: string;
  data: string;
}

export interface DeleteFileRequest {
  objectKey: string;
}

export interface FeedComment {
  /** 冗余头像 */
  avatar?: string;
  content?: string;
  created_at?: string;
  id?: string;
  like_count?: number;
  post_id?: string;
  /** 回复的用户名 */
  reply_to?: string;
  updated_at?: string;
  user_id?: string;
  /** 用户信息版本号 */
  user_profile_version?: number;
  /** 冗余字段 */
  username?: string;
}

export interface FeedCommentResponse {
  comments?: FeedComment[];
  has_more?: boolean;
  next_cursor?: string;
  total?: number;
}

export interface FeedPost {
  /** 冗余头像 */
  avatar?: string;
  comment_count?: number;
  /** 文字内容（可选） */
  content?: string;
  created_at?: string;
  id?: string;
  /** 图片URL（可选） */
  image_url?: string;
  like_count?: number;
  /** 用户状态emoji */
  status?: string;
  updated_at?: string;
  user_id?: string;
  /** 用户信息版本号 */
  user_profile_version?: number;
  /** 冗余字段 */
  username?: string;
}

export interface FeedPostResponse {
  has_more?: boolean;
  next_cursor?: string;
  posts?: FeedPost[];
}

export interface FileInfo {
  lastModified?: string;
  name?: string;
  objectKey?: string;
  size?: number;
  url?: string;
}

export interface FileListResponse {
  files?: FileInfo[];
  isTruncated?: boolean;
  nextMarker?: string;
}

export interface FileUploadResponse {
  /** 哈希化文件名 */
  hashifyName?: string;
  objectKey?: string;
  size?: number;
  type?: string;
  uploadTime?: string;
  url?: string;
}

export interface GenerateRequest {
  model?: string;
  parameters?: Record<string, any>;
  prompt: string;
}

export interface GenerateResponse {
  content?: string;
  created_at?: string;
  id?: string;
  model?: string;
  usage?: Usage;
}

export interface GetURLRequest {
  objectKey: string;
}

export interface GetURLResponse {
  objectKey?: string;
  url?: string;
}

export interface HashifyNameRequest {
  fileName: string;
}

export interface HashifyNameResponse {
  hashifyName?: string;
}

export interface OpenAIChatCompletionRequest {
  max_tokens?: number;
  messages: OpenAIMessage[];
  model: string;
  platform?: string;
  stream?: boolean;
  temperature?: number;
  top_p?: number;
}

export interface OpenAIChatCompletionResponse {
  choices?: OpenAIChoice[];
  created?: number;
  id?: string;
  model?: string;
  object?: string;
  usage?: OpenAIUsage;
}

export interface OpenAIChoice {
  finish_reason?: string;
  index?: number;
  message?: OpenAIMessage;
}

export interface OpenAIMessage {
  content: string;
  role: string;
}

export interface OpenAIUsage {
  completion_tokens?: number;
  prompt_tokens?: number;
  total_tokens?: number;
}

export interface Pagination {
  current?: number;
  pageSize?: number;
  total?: number;
}

export interface PaginationResponse {
  data?: any[];
  pagination?: Pagination;
}

export interface STSCredentials {
  /** NOTE：注意官方的字段是大写开头的 */
  AccessKeyId?: string;
  AccessKeySecret?: string;
  Expiration?: string;
  SecurityToken?: string;
}

export interface STSResponse {
  credentials?: STSCredentials;
}

export interface SignRequest {
  /** 文件名 */
  fileName?: string;
  /** 文件类型，用于路径计算 */
  fileType?: string;
  /** 完整的objectKey，如果提供则直接使用 */
  objectKey?: string;
  /** 路径前缀 */
  prefix?: string;
}

export interface SignResponse {
  objectKey?: string;
  signedUrl?: string;
}

export interface TodoCreateRequest {
  /** 可选 */
  description?: string;
  /** 可选 */
  due_date?: string;
  /** 可选，不传则自动分配 */
  position?: number;
  /** 可选 */
  priority?: number;
  /** 必填 */
  title: string;
}

export interface TodoPositionItem {
  /** 必填 */
  id: number;
  /** 必填 */
  position: number;
}

export interface TodoPositionUpdateRequest {
  /** 必填，dive验证数组元素 */
  items: TodoPositionItem[];
}

export interface TodoResponse {
  completed?: boolean;
  created_at?: string;
  description?: string;
  due_date?: string;
  id?: number;
  position?: number;
  priority?: number;
  title?: string;
  updated_at?: string;
}

export interface TodoUpdateRequest {
  /** 可选，使用指针区分false和未设置 */
  completed?: boolean;
  /** 可选，不传不更新 */
  description?: string;
  /** 可选，不传不更新 */
  due_date?: string;
  /** 可选，支持更新排序位置 */
  position?: number;
  /** 可选，不传不更新 */
  priority?: number;
  /** 可选，不传不更新 */
  title?: string;
}

export interface Usage {
  completion_tokens?: number;
  prompt_tokens?: number;
  total_tokens?: number;
}

export interface UserCreateRequest {
  email: string;
  /** @minLength 6 */
  password: string;
  /**
   * @minLength 3
   * @maxLength 50
   */
  username: string;
}

export interface UserCreateResponse {
  token?: string;
  user?: UserResponse;
}

export interface UserLoginRequest {
  password: string;
  username: string;
}

export interface UserLoginResponse {
  token?: string;
  user?: UserResponse;
}

export interface UserResponse {
  avatar?: string;
  avatar_oss_key?: string;
  created_at?: string;
  email?: string;
  extra?: string;
  id?: number;
  is_active?: boolean;
  profile_version?: number;
  role?: string;
  status?: string;
  updated_at?: string;
  username?: string;
}

export interface UserUpdateRequest {
  avatar?: string;
  avatar_oss_key?: string;
  email?: string;
  extra?: string;
  status?: string;
  /**
   * @minLength 3
   * @maxLength 50
   */
  username?: string;
}

export interface Response<T = any> {
  code?: number;
  data?: T;
  message?: string;
}

export type StatusListData = Response<Record<string, any>>;

export interface GetUsersParams {
  /** 页码 */
  page: number;
  /** 每页数量 */
  limit: number;
}

export type GetUsersData = Response<PaginationResponse>;

export type GetUserByIdData = Response<UserResponse>;

export type DeleteUserData = Response<Record<string, any>>;

export type ActivateUserData = Response<Record<string, any>>;

export type UsersDeactivateCreateData = Response<Record<string, any>>;

/** 新密码 */
export interface UsersResetPasswordCreatePayload {
  new_password?: string;
}

export type UsersResetPasswordCreateData = Response<Record<string, any>>;

export type ChatCreateData = Response<ChatResponse>;

export interface ChatHistoryListParams {
  /** 会话ID */
  session_id: string;
}

export type ChatHistoryListData = Response<ChatMessage[]>;

export interface ChatHistoryDeleteParams {
  /** 会话ID */
  session_id: string;
}

export type ChatHistoryDeleteData = Response;

export type GenerateCreateData = Response<GenerateResponse>;

export type ModelsListData = Response<AIModel[]>;

export interface V1ChatCompletionsCreateParams {
  /** 平台 */
  platform?: string;
}

export type V1ChatCompletionsCreateData = OpenAIChatCompletionResponse;

/** 图片生成请求 */
export interface V1ImagesGenerationsCreatePayload {
  model?: string;
  prompt?: string;
}

export interface V1ImagesGenerationsCreateParams {
  /** 平台 */
  platform?: string;
}

export type V1ImagesGenerationsCreateData = Response<string[]>;

export type FeedCommentsLikeCreateData = Response;

export interface FeedPostsListParams {
  /**
   * 排序类型
   * @default "time"
   */
  sort?: "time" | "like" | "comment";
  /** cursor分页的after_id */
  after_id?: string;
  /**
   * 每页数量
   * @min 1
   * @max 50
   * @default 20
   */
  limit?: number;
}

export type FeedPostsListData = FeedPostResponse;

export type FeedPostsCreateData = FeedPost;

export type FeedPostsDetailData = FeedPost;

export interface FeedPostsCommentsListParams {
  /** cursor分页的after_id */
  after_id?: string;
  /**
   * 每页数量
   * @min 1
   * @max 50
   * @default 20
   */
  limit?: number;
  /** 帖子ID */
  postId: string;
}

export type FeedPostsCommentsListData = FeedCommentResponse;

export type FeedPostsCommentsCreateData = FeedComment;

export type FeedPostsLikeCreateData = Response;

export interface GetListParams {
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
  /** 分类 */
  category?: string;
}

export type GetListData = Response<Record<string, any>>;

export type CreateData = Response<CrudResponse>;

export type GetByIdData = Response<CrudResponse>;

export type UpdateData = Response<CrudResponse>;

export type DeleteData = Response<Record<string, any>>;

export type DeleteResult = Response<Record<string, any>>;

export interface GetFileListParams {
  /** 前缀 */
  prefix?: string;
  /** 最大数量 */
  maxKeys?: number;
}

export type GetFileListData = Response<FileListResponse>;

export type HashifyNameData = Response<HashifyNameResponse>;

export type SignToFetchData = Response<SignResponse>;

export type SignToUploadData = Response<SignResponse>;

export type GetStsCredentialsData = Response<STSResponse>;

export interface UploadFilePayload {
  /**
   * 文件
   * @format binary
   */
  file: File;
  /** 文件名 */
  fileName?: string;
  /** 前缀 */
  prefix?: string;
  /** 不预览 */
  noPreview?: string;
}

export type UploadFileData = Response<FileUploadResponse>;

export type GetFileUrlData = Response<GetURLResponse>;

export interface GetTestParams {
  /** 错误类型 */
  type?:
    | "400"
    | "401"
    | "403"
    | "404"
    | "405"
    | "409"
    | "413"
    | "429"
    | "500"
    | "503"
    | "validation"
    | "success";
  /** 自定义错误消息 */
  message?: string;
}

export type GetTestData = Response<Record<string, any>>;

/** 测试请求体 */
export type PostTestPayload = Record<string, any>;

export type PostTestData = Response<Record<string, any>>;

export type ErrBusinessDetailData = Response<Record<string, any>>;

export type ErrCodeDetailData = Response<Record<string, any>>;

export type ErrNetworkDetailData = Response<Record<string, any>>;

export type ErrParamDetailData = Response<Record<string, any>>;

export interface GetTodoListParams {
  /** 页码 */
  page?: number;
  /** 每页数量 */
  limit?: number;
  /** 完成状态 */
  completed?: boolean;
}

export type GetTodoListData = Response<Record<string, any>>;

export type CreateTodoData = Response<TodoResponse>;

export type UpdateTodoPositionsData = Response<Record<string, any>>;

export type RebalanceTodoPositionsData = Response<Record<string, any>>;

export type GetTodoStatsData = Response<Record<string, any>>;

export type GetTodoByIdData = Response<TodoResponse>;

export type UpdateTodoData = Response<TodoResponse>;

export type DeleteTodoData = Response<Record<string, any>>;

export type ToggleTodoCompleteData = Response<TodoResponse>;

export type ChangePasswordCreateData = Response<Record<string, any>>;

export interface CheckFieldListParams {
  /** 字段名 */
  field: string;
  /** 字段值 */
  value: string;
}

export type CheckFieldListData = Response<boolean>;

export type LoginData = Response<UserLoginResponse>;

export type LogoutCreateData = Response<Record<string, any>>;

export type GetProfileData = Response<UserResponse>;

export type UpdateProfileData = Response<UserResponse>;

export type RegisterData = Response<UserCreateResponse>;

import type {
  AxiosInstance,
  AxiosRequestConfig,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "http://localhost:8080",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<T> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance
      .request({
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type ? { "Content-Type": type } : {}),
        },
        params: query,
        responseType: responseFormat,
        data: body,
        url: path,
      })
      .then((response) => response.data);
  };
}

/**
 * @title AI Models API
 * @version 1.0
 * @license MIT (https://opensource.org/licenses/MIT)
 * @termsOfService http://swagger.io/terms/
 * @baseUrl http://localhost:8080
 * @contact API Support <support@example.com>
 *
 * AI Models Backend API documentation
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  admin = {
    /**
     * @description 获取系统运行状态信息，包括用户统计数据和系统基本信息，用于管理员监控
     *
     * @tags Admin
     * @name StatusList
     * @summary 获取系统状态
     * @request GET:/admin/status
     */
    statusList: (params: RequestParams = {}) =>
      this.request<StatusListData, any>({
        path: `/admin/status`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 管理员分页获取系统中所有用户的列表，支持分页查询
     *
     * @tags Admin
     * @name GetUsers
     * @summary 获取用户列表
     * @request GET:/admin/users
     */
    getUsers: (query: GetUsersParams, params: RequestParams = {}) =>
      this.request<GetUsersData, any>({
        path: `/admin/users`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 管理员根据用户ID获取指定用户的详细信息，用于用户管理
     *
     * @tags Admin
     * @name GetUserById
     * @summary 根据ID获取用户信息
     * @request GET:/admin/users/{id}
     */
    getUserById: (id: string, params: RequestParams = {}) =>
      this.request<GetUserByIdData, any>({
        path: `/admin/users/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 管理员删除指定用户账户，此操作将永久删除用户数据，请谨慎使用
     *
     * @tags Admin
     * @name DeleteUser
     * @summary 删除用户
     * @request DELETE:/admin/users/{id}
     */
    deleteUser: (id: string, params: RequestParams = {}) =>
      this.request<DeleteUserData, any>({
        path: `/admin/users/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description 管理员激活指定用户账户，激活后用户可以正常登录和使用系统
     *
     * @tags Admin
     * @name ActivateUser
     * @summary 激活用户
     * @request POST:/admin/users/{id}/activate
     */
    activateUser: (id: string, params: RequestParams = {}) =>
      this.request<ActivateUserData, any>({
        path: `/admin/users/${id}/activate`,
        method: "POST",
        ...params,
      }),

    /**
     * @description 管理员停用指定用户账户，停用后用户无法登录和使用系统功能
     *
     * @tags Admin
     * @name UsersDeactivateCreate
     * @summary 停用用户
     * @request POST:/admin/users/{id}/deactivate
     */
    usersDeactivateCreate: (id: string, params: RequestParams = {}) =>
      this.request<UsersDeactivateCreateData, any>({
        path: `/admin/users/${id}/deactivate`,
        method: "POST",
        ...params,
      }),

    /**
     * @description 管理员重置指定用户的密码，通常用于用户忘记密码或管理员主动重置的场景
     *
     * @tags Admin
     * @name UsersResetPasswordCreate
     * @summary 重置用户密码
     * @request POST:/admin/users/{id}/reset-password
     */
    usersResetPasswordCreate: (
      id: string,
      request: UsersResetPasswordCreatePayload,
      params: RequestParams = {},
    ) =>
      this.request<UsersResetPasswordCreateData, any>({
        path: `/admin/users/${id}/reset-password`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),
  };
  ai = {
    /**
     * @description 与AI模型进行对话聊天，支持流式和非流式响应，可以指定使用的AI模型
     *
     * @tags AI
     * @name ChatCreate
     * @summary AI聊天
     * @request POST:/ai/chat
     */
    chatCreate: (request: ChatRequest, params: RequestParams = {}) =>
      this.request<ChatCreateData, any>({
        path: `/ai/chat`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 获取用户的历史聊天记录，支持分页和过滤
     *
     * @tags AI
     * @name ChatHistoryList
     * @summary 获取聊天历史
     * @request GET:/ai/chat/history
     */
    chatHistoryList: (
      query: ChatHistoryListParams,
      params: RequestParams = {},
    ) =>
      this.request<ChatHistoryListData, any>({
        path: `/ai/chat/history`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 清除用户的历史聊天记录，支持按会话ID清除
     *
     * @tags AI
     * @name ChatHistoryDelete
     * @summary 清除聊天历史
     * @request DELETE:/ai/chat/history
     */
    chatHistoryDelete: (
      query: ChatHistoryDeleteParams,
      params: RequestParams = {},
    ) =>
      this.request<ChatHistoryDeleteData, any>({
        path: `/ai/chat/history`,
        method: "DELETE",
        query: query,
        ...params,
      }),

    /**
     * @description 基于提示词生成文本内容，支持自定义参数和不同的AI模型
     *
     * @tags AI
     * @name GenerateCreate
     * @summary 文本生成
     * @request POST:/ai/generate
     */
    generateCreate: (request: GenerateRequest, params: RequestParams = {}) =>
      this.request<GenerateCreateData, any>({
        path: `/ai/generate`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 获取可用的AI模型列表，支持不同的AI平台和模型类型
     *
     * @tags AI
     * @name ModelsList
     * @summary 获取模型列表
     * @request GET:/ai/models
     */
    modelsList: (params: RequestParams = {}) =>
      this.request<ModelsListData, any>({
        path: `/ai/models`,
        method: "GET",
        ...params,
      }),

    /**
     * @description OpenAI兼容聊天接口，支持流式和非流式响应，可以指定使用的AI模型
     *
     * @tags AI
     * @name V1ChatCompletionsCreate
     * @summary OpenAI兼容聊天接口
     * @request POST:/ai/v1/chat/completions
     */
    v1ChatCompletionsCreate: (
      query: V1ChatCompletionsCreateParams,
      request: OpenAIChatCompletionRequest,
      params: RequestParams = {},
    ) =>
      this.request<V1ChatCompletionsCreateData, any>({
        path: `/ai/v1/chat/completions`,
        method: "POST",
        query: query,
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 基于提示词生成图片，支持自定义参数和不同的AI模型
     *
     * @tags AI
     * @name V1ImagesGenerationsCreate
     * @summary 图片生成
     * @request POST:/ai/v1/images/generations
     */
    v1ImagesGenerationsCreate: (
      query: V1ImagesGenerationsCreateParams,
      request: V1ImagesGenerationsCreatePayload,
      params: RequestParams = {},
    ) =>
      this.request<V1ImagesGenerationsCreateData, any>({
        path: `/ai/v1/images/generations`,
        method: "POST",
        query: query,
        body: request,
        type: ContentType.Json,
        ...params,
      }),
  };
  api = {
    /**
     * @description 点赞或取消点赞评论，需要登录
     *
     * @tags Feed
     * @name FeedCommentsLikeCreate
     * @summary 切换评论点赞状态
     * @request POST:/api/feed/comments/{comment_id}/like
     */
    feedCommentsLikeCreate: (commentId: string, params: RequestParams = {}) =>
      this.request<FeedCommentsLikeCreateData, Response>({
        path: `/api/feed/comments/${commentId}/like`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 支持多种排序方式和cursor分页
     *
     * @tags Feed
     * @name FeedPostsList
     * @summary 获取信息流帖子列表
     * @request GET:/api/feed/posts
     */
    feedPostsList: (query: FeedPostsListParams, params: RequestParams = {}) =>
      this.request<FeedPostsListData, Response>({
        path: `/api/feed/posts`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 创建新的信息流帖子，需要登录
     *
     * @tags Feed
     * @name FeedPostsCreate
     * @summary 创建信息流帖子
     * @request POST:/api/feed/posts
     */
    feedPostsCreate: (
      request: CreateFeedPostRequest,
      params: RequestParams = {},
    ) =>
      this.request<FeedPostsCreateData, Response>({
        path: `/api/feed/posts`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取指定帖子的详细信息
     *
     * @tags Feed
     * @name FeedPostsDetail
     * @summary 获取帖子详情
     * @request GET:/api/feed/posts/{post_id}
     */
    feedPostsDetail: (postId: string, params: RequestParams = {}) =>
      this.request<FeedPostsDetailData, Response>({
        path: `/api/feed/posts/${postId}`,
        method: "GET",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 获取指定帖子的评论列表，支持cursor分页
     *
     * @tags Feed
     * @name FeedPostsCommentsList
     * @summary 获取帖子评论列表
     * @request GET:/api/feed/posts/{post_id}/comments
     */
    feedPostsCommentsList: (
      { postId, ...query }: FeedPostsCommentsListParams,
      params: RequestParams = {},
    ) =>
      this.request<FeedPostsCommentsListData, Response>({
        path: `/api/feed/posts/${postId}/comments`,
        method: "GET",
        query: query,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 为指定帖子创建评论，需要登录
     *
     * @tags Feed
     * @name FeedPostsCommentsCreate
     * @summary 创建帖子评论
     * @request POST:/api/feed/posts/{post_id}/comments
     */
    feedPostsCommentsCreate: (
      postId: string,
      request: CreateFeedCommentRequest,
      params: RequestParams = {},
    ) =>
      this.request<FeedPostsCommentsCreateData, Response>({
        path: `/api/feed/posts/${postId}/comments`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description 点赞或取消点赞帖子，需要登录
     *
     * @tags Feed
     * @name FeedPostsLikeCreate
     * @summary 切换帖子点赞状态
     * @request POST:/api/feed/posts/{post_id}/like
     */
    feedPostsLikeCreate: (postId: string, params: RequestParams = {}) =>
      this.request<FeedPostsLikeCreateData, Response>({
        path: `/api/feed/posts/${postId}/like`,
        method: "POST",
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  crud = {
    /**
     * @description 分页获取数据记录列表，支持按分类筛选，返回分页信息和记录数据
     *
     * @tags CRUD
     * @name GetList
     * @summary 获取记录列表
     * @request GET:/crud
     */
    getList: (query: GetListParams, params: RequestParams = {}) =>
      this.request<GetListData, any>({
        path: `/crud`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 创建新的数据记录，支持分类，数据是字符串，前端自行管理决定是否要json parse
     *
     * @tags CRUD
     * @name Create
     * @summary 创建记录
     * @request POST:/crud
     */
    create: (request: CrudCreateRequest, params: RequestParams = {}) =>
      this.request<CreateData, any>({
        path: `/crud`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 根据唯一标识符获取指定的数据记录详细信息
     *
     * @tags CRUD
     * @name GetById
     * @summary 根据ID获取记录
     * @request GET:/crud/{id}
     */
    getById: (id: string, params: RequestParams = {}) =>
      this.request<GetByIdData, any>({
        path: `/crud/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 根据ID更新现有数据记录的内容，支持更新数据和分类信息
     *
     * @tags CRUD
     * @name Update
     * @summary 更新记录
     * @request PUT:/crud/{id}
     */
    update: (
      id: string,
      request: CrudUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<UpdateData, any>({
        path: `/crud/${id}`,
        method: "PUT",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 根据ID永久删除指定的数据记录，操作不可逆，请谨慎使用
     *
     * @tags CRUD
     * @name Delete
     * @summary 删除记录
     * @request DELETE:/crud/{id}
     */
    delete: (id: string, params: RequestParams = {}) =>
      this.request<DeleteData, any>({
        path: `/crud/${id}`,
        method: "DELETE",
        ...params,
      }),
  };
  oss = {
    /**
     * @description 删除OSS文件
     *
     * @tags OSS
     * @name Delete
     * @summary 删除
     * @request DELETE:/oss/delete
     */
    delete: (request: DeleteFileRequest, params: RequestParams = {}) =>
      this.request<DeleteResult, any>({
        path: `/oss/delete`,
        method: "DELETE",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 获取OSS文件列表
     *
     * @tags OSS
     * @name GetFileList
     * @summary 获取文件列表
     * @request GET:/oss/files
     */
    getFileList: (query: GetFileListParams, params: RequestParams = {}) =>
      this.request<GetFileListData, any>({
        path: `/oss/files`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 生成哈希文件名，防止重名
     *
     * @tags OSS
     * @name HashifyName
     * @summary 生成哈希文件名
     * @request POST:/oss/hashify
     */
    hashifyName: (request: HashifyNameRequest, params: RequestParams = {}) =>
      this.request<HashifyNameData, any>({
        path: `/oss/hashify`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 生成获取签名，用于下载文件
     *
     * @tags OSS
     * @name SignToFetch
     * @summary 生成获取签名
     * @request POST:/oss/sign-to-fetch
     */
    signToFetch: (request: SignRequest, params: RequestParams = {}) =>
      this.request<SignToFetchData, any>({
        path: `/oss/sign-to-fetch`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 生成上传签名，用于上传文件
     *
     * @tags OSS
     * @name SignToUpload
     * @summary 生成上传签名
     * @request POST:/oss/sign-to-upload
     */
    signToUpload: (request: SignRequest, params: RequestParams = {}) =>
      this.request<SignToUploadData, any>({
        path: `/oss/sign-to-upload`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 获取STS临时凭证，用于上传文件，或者浏览
     *
     * @tags OSS
     * @name GetStsCredentials
     * @summary STS临时凭证
     * @request GET:/oss/sts
     */
    getStsCredentials: (params: RequestParams = {}) =>
      this.request<GetStsCredentialsData, any>({
        path: `/oss/sts`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 直接上传文件到OSS
     *
     * @tags OSS
     * @name UploadFile
     * @summary 直接上传文件
     * @request POST:/oss/upload
     */
    uploadFile: (data: UploadFilePayload, params: RequestParams = {}) =>
      this.request<UploadFileData, any>({
        path: `/oss/upload`,
        method: "POST",
        body: data,
        type: ContentType.FormData,
        ...params,
      }),

    /**
     * No description
     *
     * @tags OSS
     * @name GetFileUrl
     * @summary 获取文件URL
     * @request POST:/oss/url
     */
    getFileUrl: (request: GetURLRequest, params: RequestParams = {}) =>
      this.request<GetFileUrlData, any>({
        path: `/oss/url`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),
  };
  test = {
    /**
     * @description 用于测试前端对各种HTTP状态码和错误响应的处理，支持通过参数指定错误类型
     *
     * @tags Test
     * @name GetTest
     * @summary 测试各种错误码
     * @request GET:/test/err
     */
    getTest: (query: GetTestParams, params: RequestParams = {}) =>
      this.request<GetTestData, any>({
        path: `/test/err`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 测试POST请求的各种错误情况，包括JSON解析错误、参数验证等
     *
     * @tags Test
     * @name PostTest
     * @summary 测试POST请求错误处理
     * @request POST:/test/err
     */
    postTest: (request: PostTestPayload, params: RequestParams = {}) =>
      this.request<PostTestData, any>({
        path: `/test/err`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 模拟各种业务逻辑错误
     *
     * @tags Test
     * @name ErrBusinessDetail
     * @summary 测试业务错误
     * @request GET:/test/err/business/{type}
     */
    errBusinessDetail: (
      type: "validation" | "auth" | "permission" | "quota" | "maintenance",
      params: RequestParams = {},
    ) =>
      this.request<ErrBusinessDetailData, any>({
        path: `/test/err/business/${type}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 根据路径参数返回对应的错误码，用于测试前端错误处理
     *
     * @tags Test
     * @name ErrCodeDetail
     * @summary 测试特定错误码
     * @request GET:/test/err/code/{code}
     */
    errCodeDetail: (
      code:
        | "400"
        | "401"
        | "403"
        | "404"
        | "405"
        | "409"
        | "413"
        | "429"
        | "500"
        | "503",
      params: RequestParams = {},
    ) =>
      this.request<ErrCodeDetailData, any>({
        path: `/test/err/code/${code}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 模拟各种网络错误情况，如超时、连接失败等
     *
     * @tags Test
     * @name ErrNetworkDetail
     * @summary 测试网络错误模拟
     * @request GET:/test/err/network/{type}
     */
    errNetworkDetail: (
      type: "timeout" | "connection" | "dns" | "ssl",
      params: RequestParams = {},
    ) =>
      this.request<ErrNetworkDetailData, any>({
        path: `/test/err/network/${type}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 测试带路径参数的请求错误处理
     *
     * @tags Test
     * @name ErrParamDetail
     * @summary 测试路径参数错误
     * @request GET:/test/err/param/{id}
     */
    errParamDetail: (id: string, params: RequestParams = {}) =>
      this.request<ErrParamDetailData, any>({
        path: `/test/err/param/${id}`,
        method: "GET",
        ...params,
      }),
  };
  todos = {
    /**
     * @description 分页获取TODO列表，按position升序排列，支持按完成状态筛选
     *
     * @tags TODO
     * @name GetTodoList
     * @summary 获取TODO列表
     * @request GET:/todos
     */
    getTodoList: (query: GetTodoListParams, params: RequestParams = {}) =>
      this.request<GetTodoListData, any>({
        path: `/todos`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 创建新的TODO项，支持设置标题、描述、优先级、位置和截止日期。不指定position时自动分配到最后
     *
     * @tags TODO
     * @name CreateTodo
     * @summary 创建TODO
     * @request POST:/todos
     */
    createTodo: (request: TodoCreateRequest, params: RequestParams = {}) =>
      this.request<CreateTodoData, any>({
        path: `/todos`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 批量更新TODO项的位置，支持拖拽排序功能
     *
     * @tags TODO
     * @name UpdateTodoPositions
     * @summary 批量更新TODO位置
     * @request PUT:/todos/positions
     */
    updateTodoPositions: (
      request: TodoPositionUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<UpdateTodoPositionsData, any>({
        path: `/todos/positions`,
        method: "PUT",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 重新平衡所有TODO项的位置值，当位置值变得过小时使用
     *
     * @tags TODO
     * @name RebalanceTodoPositions
     * @summary 重新平衡TODO位置
     * @request POST:/todos/rebalance
     */
    rebalanceTodoPositions: (params: RequestParams = {}) =>
      this.request<RebalanceTodoPositionsData, any>({
        path: `/todos/rebalance`,
        method: "POST",
        ...params,
      }),

    /**
     * @description 获取TODO的统计信息，包括总数、完成数、待完成数
     *
     * @tags TODO
     * @name GetTodoStats
     * @summary 获取TODO统计信息
     * @request GET:/todos/stats
     */
    getTodoStats: (params: RequestParams = {}) =>
      this.request<GetTodoStatsData, any>({
        path: `/todos/stats`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 根据唯一标识符获取指定的TODO项详细信息
     *
     * @tags TODO
     * @name GetTodoById
     * @summary 根据ID获取TODO
     * @request GET:/todos/{id}
     */
    getTodoById: (id: string, params: RequestParams = {}) =>
      this.request<GetTodoByIdData, any>({
        path: `/todos/${id}`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 根据ID更新现有TODO项的内容，支持更新标题、描述、完成状态、优先级、位置等
     *
     * @tags TODO
     * @name UpdateTodo
     * @summary 更新TODO
     * @request PUT:/todos/{id}
     */
    updateTodo: (
      id: string,
      request: TodoUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<UpdateTodoData, any>({
        path: `/todos/${id}`,
        method: "PUT",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 根据ID永久删除指定的TODO项，操作不可逆
     *
     * @tags TODO
     * @name DeleteTodo
     * @summary 删除TODO
     * @request DELETE:/todos/{id}
     */
    deleteTodo: (id: string, params: RequestParams = {}) =>
      this.request<DeleteTodoData, any>({
        path: `/todos/${id}`,
        method: "DELETE",
        ...params,
      }),

    /**
     * @description 快速切换TODO项的完成状态（完成/未完成）
     *
     * @tags TODO
     * @name ToggleTodoComplete
     * @summary 切换TODO完成状态
     * @request PATCH:/todos/{id}/toggle
     */
    toggleTodoComplete: (id: string, params: RequestParams = {}) =>
      this.request<ToggleTodoCompleteData, any>({
        path: `/todos/${id}/toggle`,
        method: "PATCH",
        ...params,
      }),
  };
  users = {
    /**
     * @description 用户修改自己的登录密码，需要提供旧密码进行验证
     *
     * @tags User
     * @name ChangePasswordCreate
     * @summary 修改密码
     * @request POST:/users/change-password
     */
    changePasswordCreate: (
      request: ChangePasswordRequest,
      params: RequestParams = {},
    ) =>
      this.request<ChangePasswordCreateData, any>({
        path: `/users/change-password`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 检查用户对应的字段是否存在（通常是email和username）
     *
     * @tags Auth
     * @name CheckFieldList
     * @summary 检查用户字段是否存在
     * @request GET:/users/check-field
     */
    checkFieldList: (query: CheckFieldListParams, params: RequestParams = {}) =>
      this.request<CheckFieldListData, any>({
        path: `/users/check-field`,
        method: "GET",
        query: query,
        ...params,
      }),

    /**
     * @description 用户使用用户名和密码登录系统，验证成功后返回JWT token和用户信息
     *
     * @tags Auth
     * @name Login
     * @summary 用户登录
     * @request POST:/users/login
     */
    login: (request: UserLoginRequest, params: RequestParams = {}) =>
      this.request<LoginData, any>({
        path: `/users/login`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 用户主动退出登录，清除服务端的登录状态和token
     *
     * @tags Auth
     * @name LogoutCreate
     * @summary 用户退出登录
     * @request POST:/users/logout
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<LogoutCreateData, any>({
        path: `/users/logout`,
        method: "POST",
        ...params,
      }),

    /**
     * @description 获取当前登录用户的个人资料信息，包括基本信息、角色等
     *
     * @tags User
     * @name GetProfile
     * @summary 获取用户信息
     * @request GET:/users/profile
     */
    getProfile: (params: RequestParams = {}) =>
      this.request<GetProfileData, Response>({
        path: `/users/profile`,
        method: "GET",
        ...params,
      }),

    /**
     * @description 更新当前登录用户的个人资料，如用户名、邮箱、头像等信息
     *
     * @tags User
     * @name UpdateProfile
     * @summary 更新用户信息
     * @request PUT:/users/profile
     */
    updateProfile: (request: UserUpdateRequest, params: RequestParams = {}) =>
      this.request<UpdateProfileData, any>({
        path: `/users/profile`,
        method: "PUT",
        body: request,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description 新用户注册账号，创建用户账户并返回JWT token，用于后续身份认证
     *
     * @tags Auth
     * @name Register
     * @summary 用户注册
     * @request POST:/users/register
     */
    register: (request: UserCreateRequest, params: RequestParams = {}) =>
      this.request<RegisterData, any>({
        path: `/users/register`,
        method: "POST",
        body: request,
        type: ContentType.Json,
        ...params,
      }),
  };
}
