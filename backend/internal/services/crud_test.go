package services

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/testutil"
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCrudService_Simple(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {

		aData := map[string]any{"value": 123}
		cData := map[string]any{"value": 789}

		s := NewCrudService()

		// 创建A
		aJ, _ := json.Marshal(aData)
		aReq := models.CrudCreateRequest{Data: string(aJ)}
		a, err := s.CreateCrud(aReq)
		require.NoError(t, err)
		assert.NotNil(t, a)
		assert.NotZero(t, a.ID)
		assert.Equal(t, string(aJ), a.Data)
		assert.NotZero(t, a.CreatedAt)
		assert.NotZero(t, a.UpdatedAt)

		// 校验A数据
		var aMap map[string]any
		err = json.Unmarshal([]byte(a.Data), &aMap)
		require.NoError(t, err)
		assert.Equal(t, float64(aData["value"].(int)), aMap["value"])

		// 读取A
		a2, err := s.GetCrudByID(a.ID)
		require.NoError(t, err)
		assert.Equal(t, a.ID, a2.ID)
		assert.Equal(t, a.Data, a2.Data)

		// 更新A
		cJ, _ := json.Marshal(cData)
		cReq := models.CrudUpdateRequest{Data: string(cJ)}
		a3, err := s.UpdateCrud(a.ID, cReq)
		require.NoError(t, err)
		assert.Equal(t, a.ID, a3.ID)
		assert.Equal(t, string(cJ), a3.Data)
		assert.True(t, a3.UpdatedAt.After(a.UpdatedAt))

		// 校验更新后A
		var cMap map[string]any
		err = json.Unmarshal([]byte(a3.Data), &cMap)
		require.NoError(t, err)
		assert.Equal(t, float64(cData["value"].(int)), cMap["value"])

		// 删除A
		err = s.DeleteCrud(a.ID)
		require.NoError(t, err)

		// 查A应该查不到
		a4, err := s.GetCrudByID(a.ID)
		assert.Error(t, err)
		assert.Nil(t, a4)
		assert.Contains(t, err.Error(), "记录不存在")
	})
}

func TestCrudService_InvalidRequests(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		s := NewCrudService()

		// 获取不存在
		r, err := s.GetCrudByID(99999)
		assert.Error(t, err)
		assert.Nil(t, r)
		assert.Contains(t, err.Error(), "记录不存在")

		// 更新不存在
		req := models.CrudUpdateRequest{Data: `{"test": "data"}`}
		r2, err := s.UpdateCrud(99999, req)
		assert.Error(t, err)
		assert.Nil(t, r2)
		assert.Contains(t, err.Error(), "记录不存在")

		// 删除不存在
		err = s.DeleteCrud(99999)
		assert.Error(t, err)
		assert.Contains(t, err.Error(), "记录不存在")
	})
}

func TestCrudService_Category(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		s := NewCrudService()

		g1 := "test-g1"
		g2 := "test-g2"
		limit := 100 // NOTE: 如果这个组其他用了，可能就不准了
		aData := map[string]any{"value": 123}
		bData := map[string]any{"value": 456}
		cData := map[string]any{"value": 789}

		// 创建A，设置为g1组
		aJ, _ := json.Marshal(aData)
		aReq := models.CrudCreateRequest{Category: g1, Data: string(aJ)}
		a, err := s.CreateCrud(aReq)
		require.NoError(t, err)
		assert.NotNil(t, a)
		assert.Equal(t, g1, a.Category)

		// 创建B，设置为g1组
		bJ, _ := json.Marshal(bData)
		bReq := models.CrudCreateRequest{Category: g1, Data: string(bJ)}
		b, err := s.CreateCrud(bReq)
		require.NoError(t, err)
		assert.NotNil(t, b)
		assert.Equal(t, g1, b.Category)

		// 创建C，设置为g2组
		cJ, _ := json.Marshal(cData)
		cReq := models.CrudCreateRequest{Category: g2, Data: string(cJ)}
		c, err := s.CreateCrud(cReq)
		require.NoError(t, err)
		assert.NotNil(t, c)
		assert.Equal(t, g2, c.Category)

		// 查询g1组，应该得到a和b，不包含c
		list, err := s.GetCruds(1, limit, g1)
		require.NoError(t, err)
		assert.NotNil(t, list)

		ds, ok := list["data"].([]models.CrudResponse)
		require.True(t, ok)
		assert.Equal(t, 2, len(ds))

		// 验证返回的数据都是g1组
		foundA, foundB := false, false
		for _, item := range ds {
			assert.Equal(t, g1, item.Category)

			var dMap map[string]any
			json.Unmarshal([]byte(item.Data), &dMap)

			if dMap["value"] == float64(123) {
				foundA = true
			} else if dMap["value"] == float64(456) {
				foundB = true
			}
		}
		assert.True(t, foundA, "应该找到数据A")
		assert.True(t, foundB, "应该找到数据B")

		// 验证g2组只有c
		list2, err := s.GetCruds(1, limit, g2)
		require.NoError(t, err)
		ds2, ok := list2["data"].([]models.CrudResponse)
		require.True(t, ok)
		assert.Equal(t, 1, len(ds2))
		assert.Equal(t, g2, ds2[0].Category)

		// 清理abc数据
		err = s.DeleteCrud(a.ID)
		require.NoError(t, err)
		err = s.DeleteCrud(b.ID)
		require.NoError(t, err)
		err = s.DeleteCrud(c.ID)
		require.NoError(t, err)
	})
}
