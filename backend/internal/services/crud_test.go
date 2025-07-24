package services

import (
	"ai-models-backend/internal/models"
	"ai-models-backend/internal/testutil"
	"encoding/json"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

var (
	dataA = map[string]any{"name": "测试数据A", "type": "example", "value": 123}
	dataB = map[string]any{"name": "测试数据B", "type": "example", "value": 456, "description": "这是一个测试数据"}
	dataC = map[string]any{"name": "更新后的数据A", "type": "updated", "value": 789, "active": true}
)

func TestCrudService_CRUD(t *testing.T) {
	testutil.RunWithTestDB(t, func(t *testing.T) {
		s := NewCrudService()

		// 创建A
		aJSON, _ := json.Marshal(dataA)
		reqA := models.CrudCreateRequest{Data: string(aJSON)}
		a, err := s.CreateCrud(reqA)
		require.NoError(t, err)
		assert.NotNil(t, a)
		assert.NotZero(t, a.ID)
		assert.Equal(t, string(aJSON), a.Data)
		assert.NotZero(t, a.CreatedAt)
		assert.NotZero(t, a.UpdatedAt)

		// 校验A数据
		var aMap map[string]any
		err = json.Unmarshal([]byte(a.Data), &aMap)
		require.NoError(t, err)
		assert.Equal(t, dataA["name"], aMap["name"])
		assert.Equal(t, float64(dataA["value"].(int)), aMap["value"])

		// 根据ID获取A
		a2, err := s.GetCrudByID(a.ID)
		require.NoError(t, err)
		assert.Equal(t, a.ID, a2.ID)
		assert.Equal(t, a.Data, a2.Data)

		// 创建B
		bJSON, _ := json.Marshal(dataB)
		reqB := models.CrudCreateRequest{Data: string(bJSON)}
		b, err := s.CreateCrud(reqB)
		require.NoError(t, err)
		assert.NotNil(t, b)
		assert.NotEqual(t, a.ID, b.ID)

		// 获取列表
		list, err := s.GetCruds(1, 10)
		require.NoError(t, err)
		assert.NotNil(t, list)
		ds, ok := list["data"].([]models.CrudResponse)
		require.True(t, ok)
		assert.GreaterOrEqual(t, len(ds), 2)
		pg, ok := list["pagination"].(models.Pagination)
		require.True(t, ok)
		assert.Equal(t, 1, pg.Current)
		assert.Equal(t, 10, pg.PageSize)
		assert.GreaterOrEqual(t, pg.Total, int64(2))

		// 更新A
		cJSON, _ := json.Marshal(dataC)
		reqC := models.CrudUpdateRequest{Data: string(cJSON)}
		a3, err := s.UpdateCrud(a.ID, reqC)
		require.NoError(t, err)
		assert.Equal(t, a.ID, a3.ID)
		assert.Equal(t, string(cJSON), a3.Data)
		assert.True(t, a3.UpdatedAt.After(a.UpdatedAt))

		// 校验更新后A
		var cMap map[string]any
		err = json.Unmarshal([]byte(a3.Data), &cMap)
		require.NoError(t, err)
		assert.Equal(t, dataC["name"], cMap["name"])
		assert.Equal(t, dataC["type"], cMap["type"])

		// 删除B
		err = s.DeleteCrud(b.ID)
		require.NoError(t, err)

		// 再查B应找不到
		b2, err := s.GetCrudByID(b.ID)
		assert.Error(t, err)
		assert.Nil(t, b2)
		assert.Contains(t, err.Error(), "记录不存在")

		// 校验列表只剩A
		list2, err := s.GetCruds(1, 10)
		require.NoError(t, err)
		ds2, ok := list2["data"].([]models.CrudResponse)
		require.True(t, ok)
		assert.Equal(t, 1, len(ds2))

		// 删除A
		err = s.DeleteCrud(a.ID)
		require.NoError(t, err)
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
