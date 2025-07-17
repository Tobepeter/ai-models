package utils

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"regexp"
	"strings"
	"time"
	"unicode"
)

// GenerateID generates a random ID
func GenerateID() string {
	bytes := make([]byte, 16)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}

// GenerateSessionID generates a session ID
func GenerateSessionID() string {
	return fmt.Sprintf("session_%d_%s", time.Now().UnixNano(), GenerateID()[:8])
}

// IsValidEmail validates email format
func IsValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)
	return emailRegex.MatchString(email)
}

// IsValidUsername validates username format
func IsValidUsername(username string) bool {
	if len(username) < 3 || len(username) > 50 {
		return false
	}
	
	// Check if username contains only alphanumeric characters and underscores
	usernameRegex := regexp.MustCompile(`^[a-zA-Z0-9_]+$`)
	return usernameRegex.MatchString(username)
}

// IsValidPassword validates password strength
func IsValidPassword(password string) bool {
	if len(password) < 6 {
		return false
	}
	
	// Check for at least one uppercase letter, one lowercase letter, and one digit
	hasUpper := false
	hasLower := false
	hasDigit := false
	
	for _, char := range password {
		if unicode.IsUpper(char) {
			hasUpper = true
		}
		if unicode.IsLower(char) {
			hasLower = true
		}
		if unicode.IsDigit(char) {
			hasDigit = true
		}
	}
	
	return hasUpper && hasLower && hasDigit
}

// SanitizeString removes potentially dangerous characters from strings
func SanitizeString(input string) string {
	// Remove HTML tags
	re := regexp.MustCompile(`<[^>]*>`)
	sanitized := re.ReplaceAllString(input, "")
	
	// Remove extra whitespace
	sanitized = strings.TrimSpace(sanitized)
	
	return sanitized
}

// TruncateString truncates a string to a specified length
func TruncateString(input string, length int) string {
	if len(input) <= length {
		return input
	}
	return input[:length] + "..."
}

// ContainsString checks if a slice contains a specific string
func ContainsString(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

// RemoveString removes a string from a slice
func RemoveString(slice []string, item string) []string {
	var result []string
	for _, s := range slice {
		if s != item {
			result = append(result, s)
		}
	}
	return result
}

// UniqueStrings returns unique strings from a slice
func UniqueStrings(slice []string) []string {
	seen := make(map[string]bool)
	var result []string
	
	for _, s := range slice {
		if !seen[s] {
			seen[s] = true
			result = append(result, s)
		}
	}
	
	return result
}

// FormatDuration formats duration in a human-readable format
func FormatDuration(d time.Duration) string {
	if d < time.Minute {
		return fmt.Sprintf("%.0fs", d.Seconds())
	}
	if d < time.Hour {
		return fmt.Sprintf("%.0fm", d.Minutes())
	}
	if d < 24*time.Hour {
		return fmt.Sprintf("%.0fh", d.Hours())
	}
	return fmt.Sprintf("%.0fd", d.Hours()/24)
}

// StringToPointer converts string to string pointer
func StringToPointer(s string) *string {
	return &s
}

// IntToPointer converts int to int pointer
func IntToPointer(i int) *int {
	return &i
}

// BoolToPointer converts bool to bool pointer
func BoolToPointer(b bool) *bool {
	return &b
}

// PointerToString converts string pointer to string
func PointerToString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// PointerToInt converts int pointer to int
func PointerToInt(i *int) int {
	if i == nil {
		return 0
	}
	return *i
}

// PointerToBool converts bool pointer to bool
func PointerToBool(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}

// PaginationInfo represents pagination information
type PaginationInfo struct {
	Page       int   `json:"page"`
	Limit      int   `json:"limit"`
	Total      int64 `json:"total"`
	TotalPages int   `json:"total_pages"`
	HasNext    bool  `json:"has_next"`
	HasPrev    bool  `json:"has_prev"`
}

// NewPaginationInfo creates new pagination information
func NewPaginationInfo(page, limit int, total int64) PaginationInfo {
	totalPages := int((total + int64(limit) - 1) / int64(limit))
	
	return PaginationInfo{
		Page:       page,
		Limit:      limit,
		Total:      total,
		TotalPages: totalPages,
		HasNext:    page < totalPages,
		HasPrev:    page > 1,
	}
}

// GetOffset calculates offset for pagination
func GetOffset(page, limit int) int {
	if page < 1 {
		page = 1
	}
	return (page - 1) * limit
}