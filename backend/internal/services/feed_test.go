package services

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/testutil"
	"strconv"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func getTestUser1(suffix string) models.UserCreateRequest {
	timestamp := strconv.FormatInt(time.Now().UnixNano(), 10)
	return models.UserCreateRequest{
		Username: "feeduser1" + suffix + "_" + timestamp,
		Email:    "feeduser1" + suffix + "_" + timestamp + "@example.com",
		Password: "password123",
	}
}

func getTestUser2(suffix string) models.UserCreateRequest {
	timestamp := strconv.FormatInt(time.Now().UnixNano(), 10)
	return models.UserCreateRequest{
		Username: "feeduser2" + suffix + "_" + timestamp,
		Email:    "feeduser2" + suffix + "_" + timestamp + "@example.com",
		Password: "password123",
	}
}

func TestFeedService_CreateAndGetPosts(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		// 初始化服务
		userService := NewUserService(testutil.TestConfig)
		feedService := NewFeedService(testutil.TestDB, userService)

		// 创建测试用户
		user1, err := userService.CreateUser(getTestUser1("_test1"))
		require.NoError(t, err)
		user2, err := userService.CreateUser(getTestUser2("_test1"))
		require.NoError(t, err)

		// 创建帖子
		postReq1 := models.CreateFeedPostRequest{
			Content: "这是第一个测试帖子",
		}
		post1, err := feedService.CreateFeedPost(user1.ID, postReq1)
		require.NoError(t, err)
		assert.NotNil(t, post1)
		assert.Equal(t, postReq1.Content, post1.Content)
		assert.Equal(t, user1.Username, post1.Username)
		assert.Equal(t, 0, post1.LikeCount)
		assert.Equal(t, 0, post1.CommentCount)

		postReq2 := models.CreateFeedPostRequest{
			Content:  "这是第二个测试帖子",
			ImageURL: "https://example.com/image.jpg",
		}
		post2, err := feedService.CreateFeedPost(user2.ID, postReq2)
		require.NoError(t, err)
		assert.NotNil(t, post2)
		assert.Equal(t, postReq2.Content, post2.Content)
		assert.Equal(t, postReq2.ImageURL, post2.ImageURL)

		// 获取帖子列表 - 限制查询当前用户创建的帖子数量
		params := models.FeedQueryParams{
			Sort:  "time",
			Limit: 2, // 只获取最新的2条
		}
		posts, _, _, err := feedService.GetFeedPosts(params)
		require.NoError(t, err)
		// 由于数据库中可能有其他测试数据，我们只验证新创建的帖子存在
		assert.GreaterOrEqual(t, len(posts), 2) // 至少包含我们创建的2条

		// 验证我们创建的帖子在结果中（最新的应该在前面）
		found1, found2 := false, false
		for _, post := range posts {
			if post.ID == post1.ID {
				found1 = true
				assert.Equal(t, post1.Content, post.Content)
			}
			if post.ID == post2.ID {
				found2 = true
				assert.Equal(t, post2.Content, post.Content)
			}
		}
		assert.True(t, found1, "应该找到第一个创建的帖子")
		assert.True(t, found2, "应该找到第二个创建的帖子")

		// 根据ID获取帖子详情
		postDetail, err := feedService.GetFeedPostByID(strconv.FormatUint(post1.ID, 10))
		require.NoError(t, err)
		assert.Equal(t, post1.ID, postDetail.ID)
		assert.Equal(t, post1.Content, postDetail.Content)

		// 清理测试数据
		err = userService.DeleteUser(user1.ID)
		require.NoError(t, err)
		err = userService.DeleteUser(user2.ID)
		require.NoError(t, err)
	})
}

func TestFeedService_PostLike(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		// 初始化服务
		userService := NewUserService(testutil.TestConfig)
		feedService := NewFeedService(testutil.TestDB, userService)

		// 创建测试用户
		user1, err := userService.CreateUser(getTestUser1("_test2"))
		require.NoError(t, err)
		user2, err := userService.CreateUser(getTestUser2("_test2"))
		require.NoError(t, err)

		// 创建帖子
		postReq := models.CreateFeedPostRequest{
			Content: "测试点赞功能",
		}
		post, err := feedService.CreateFeedPost(user1.ID, postReq)
		require.NoError(t, err)

		postIDStr := strconv.FormatUint(post.ID, 10)

		// 检查初始点赞数
		initialPost, err := feedService.GetFeedPostByID(postIDStr)
		require.NoError(t, err)
		initialLikeCount := initialPost.LikeCount

		// 用户2点赞
		_, err = feedService.SetFeedPostLike(user2.ID, postIDStr, true)
		require.NoError(t, err)

		// 验证点赞数增加
		updatedPost, err := feedService.GetFeedPostByID(postIDStr)
		require.NoError(t, err)
		assert.Equal(t, initialLikeCount+1, updatedPost.LikeCount)

		// 用户2取消点赞
		_, err = feedService.SetFeedPostLike(user2.ID, postIDStr, false)
		require.NoError(t, err)

		// 验证点赞数减少
		updatedPost2, err := feedService.GetFeedPostByID(postIDStr)
		require.NoError(t, err)
		assert.Equal(t, initialLikeCount, updatedPost2.LikeCount)

		// 测试不存在的帖子
		_, err = feedService.SetFeedPostLike(user1.ID, "999999", true)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "post not found")

		// 清理测试数据
		err = userService.DeleteUser(user1.ID)
		require.NoError(t, err)
		err = userService.DeleteUser(user2.ID)
		require.NoError(t, err)
	})
}

func TestFeedService_Comments(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		// 初始化服务
		userService := NewUserService(testutil.TestConfig)
		feedService := NewFeedService(testutil.TestDB, userService)

		// 创建测试用户
		user1, err := userService.CreateUser(getTestUser1("_test3"))
		require.NoError(t, err)
		user2, err := userService.CreateUser(getTestUser2("_test3"))
		require.NoError(t, err)

		// 创建帖子
		postReq := models.CreateFeedPostRequest{
			Content: "测试评论功能",
		}
		post, err := feedService.CreateFeedPost(user1.ID, postReq)
		require.NoError(t, err)

		postIDStr := strconv.FormatUint(post.ID, 10)

		// 创建评论
		commentReq1 := models.CreateFeedCommentRequest{
			Content: "这是第一条评论",
		}
		comment1, err := feedService.CreateFeedComment(user2.ID, postIDStr, commentReq1)
		require.NoError(t, err)
		assert.NotNil(t, comment1)
		assert.Equal(t, commentReq1.Content, comment1.Content)
		assert.Equal(t, user2.Username, comment1.Username)

		commentReq2 := models.CreateFeedCommentRequest{
			Content: "这是第二条评论",
			ReplyTo: user2.Username,
		}
		comment2, err := feedService.CreateFeedComment(user1.ID, postIDStr, commentReq2)
		require.NoError(t, err)
		assert.Equal(t, commentReq2.ReplyTo, comment2.ReplyTo)

		// 验证帖子评论数增加
		updatedPost, err := feedService.GetFeedPostByID(postIDStr)
		require.NoError(t, err)
		assert.Equal(t, 2, updatedPost.CommentCount)

		// 获取评论列表
		commentParams := models.CommentQueryParams{
			PostID: postIDStr,
			Limit:  10,
		}
		comments, nextCursor, hasMore, total, err := feedService.GetFeedComments(commentParams)
		require.NoError(t, err)
		assert.Len(t, comments, 2)
		assert.False(t, hasMore)
		assert.Empty(t, nextCursor)
		assert.Equal(t, int64(2), total)

		// 验证排序（最新的在前）
		assert.Equal(t, comment2.ID, comments[0].ID)
		assert.Equal(t, comment1.ID, comments[1].ID)

		// 测试评论点赞
		commentIDStr := strconv.FormatUint(comment1.ID, 10)
		_, err = feedService.SetFeedCommentLike(user1.ID, commentIDStr, true)
		require.NoError(t, err)

		// 重复点赞应该不会改变状态
		result, err := feedService.SetFeedCommentLike(user1.ID, commentIDStr, true)
		require.NoError(t, err)
		assert.False(t, result.Changed)

		// 取消点赞
		_, err = feedService.SetFeedCommentLike(user1.ID, commentIDStr, false)
		require.NoError(t, err)

		// 清理测试数据
		err = userService.DeleteUser(user1.ID)
		require.NoError(t, err)
		err = userService.DeleteUser(user2.ID)
		require.NoError(t, err)
	})
}

func TestFeedService_ErrorCases(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		// 初始化服务
		userService := NewUserService(testutil.TestConfig)
		feedService := NewFeedService(testutil.TestDB, userService)

		// 测试不存在的用户创建帖子
		postReq := models.CreateFeedPostRequest{
			Content: "测试帖子",
		}
		_, err := feedService.CreateFeedPost(999999, postReq)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "user not found")

		// 测试获取不存在的帖子
		_, err = feedService.GetFeedPostByID("999999")
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "post not found")

		// 测试为不存在的帖子创建评论
		commentReq := models.CreateFeedCommentRequest{
			Content: "测试评论",
		}
		_, err = feedService.CreateFeedComment(1, "999999", commentReq)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "post not found")
	})
}
