package services

import (
	"ai-models-backend/internal/models"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// UserService handles user-related business logic
type UserService struct {
	// In a real application, this would include database repositories
	// users map[uint]*models.User // In-memory storage for demo
}

// NewUserService creates a new UserService
func NewUserService() *UserService {
	return &UserService{
		// users: make(map[uint]*models.User),
	}
}

// CreateUser creates a new user
func (s *UserService) CreateUser(req models.UserCreateRequest) (*models.User, error) {
	// Hash the password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		ID:        uint(time.Now().UnixNano()), // Simple ID generation for demo
		Username:  req.Username,
		Email:     req.Email,
		Password:  string(hashedPassword),
		IsActive:  true,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	// In a real application, you would save to database here
	// For demo purposes, we'll just return the user

	return user, nil
}

// AuthenticateUser authenticates a user with username and password
func (s *UserService) AuthenticateUser(username, password string) (*models.User, error) {
	// In a real application, you would query the database
	// For demo purposes, we'll create a mock user
	
	// Hash the password for comparison
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	
	// Mock user for demo
	user := &models.User{
		ID:        1,
		Username:  username,
		Email:     username + "@example.com",
		Password:  string(hashedPassword),
		IsActive:  true,
		CreatedAt: time.Now().Add(-24 * time.Hour),
		UpdatedAt: time.Now(),
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	// In a real application, you would query the database
	// For demo purposes, we'll return a mock user
	
	user := &models.User{
		ID:        id,
		Username:  "demo_user",
		Email:     "demo@example.com",
		Avatar:    "https://example.com/avatar.jpg",
		IsActive:  true,
		CreatedAt: time.Now().Add(-24 * time.Hour),
		UpdatedAt: time.Now(),
	}

	return user, nil
}

// UpdateUser updates a user's information
func (s *UserService) UpdateUser(id uint, req models.UserUpdateRequest) (*models.User, error) {
	// In a real application, you would query and update the database
	// For demo purposes, we'll return a mock updated user
	
	user := &models.User{
		ID:        id,
		Username:  req.Username,
		Email:     req.Email,
		Avatar:    req.Avatar,
		IsActive:  true,
		CreatedAt: time.Now().Add(-24 * time.Hour),
		UpdatedAt: time.Now(),
	}

	// If fields are empty, keep existing values
	if req.Username == "" {
		user.Username = "demo_user"
	}
	if req.Email == "" {
		user.Email = "demo@example.com"
	}
	if req.Avatar == "" {
		user.Avatar = "https://example.com/avatar.jpg"
	}

	return user, nil
}

// GetUsers retrieves paginated users
func (s *UserService) GetUsers(page, limit int) ([]models.UserResponse, int64, error) {
	// In a real application, you would query the database with pagination
	// For demo purposes, we'll return mock users
	
	users := []models.UserResponse{
		{
			ID:        1,
			Username:  "user1",
			Email:     "user1@example.com",
			Avatar:    "https://example.com/avatar1.jpg",
			IsActive:  true,
			CreatedAt: time.Now().Add(-48 * time.Hour),
			UpdatedAt: time.Now().Add(-24 * time.Hour),
		},
		{
			ID:        2,
			Username:  "user2",
			Email:     "user2@example.com",
			Avatar:    "https://example.com/avatar2.jpg",
			IsActive:  true,
			CreatedAt: time.Now().Add(-72 * time.Hour),
			UpdatedAt: time.Now().Add(-12 * time.Hour),
		},
	}

	return users, int64(len(users)), nil
}

// DeleteUser deletes a user (soft delete)
func (s *UserService) DeleteUser(id uint) error {
	// In a real application, you would perform soft delete in database
	// For demo purposes, we'll just return nil
	return nil
}

// ActivateUser activates a user account
func (s *UserService) ActivateUser(id uint) error {
	// In a real application, you would update the database
	// For demo purposes, we'll just return nil
	return nil
}

// DeactivateUser deactivates a user account
func (s *UserService) DeactivateUser(id uint) error {
	// In a real application, you would update the database
	// For demo purposes, we'll just return nil
	return nil
}