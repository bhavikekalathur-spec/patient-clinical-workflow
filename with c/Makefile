CC = gcc
CFLAGS = -Wall -Wextra -std=c99
TARGET = workflow
SOURCE = workflow.c

# Default target
all: $(TARGET)

# Build the executable
$(TARGET): $(SOURCE)
	$(CC) $(CFLAGS) -o $(TARGET) $(SOURCE)

# Clean build artifacts
clean:
	rm -f $(TARGET)

# Install dependencies (none needed for basic C implementation)
install:
	@echo "No external dependencies required for basic C implementation"

# Run the server
run: $(TARGET)
	./$(TARGET)

# Debug build
debug: CFLAGS += -g -DDEBUG
debug: $(TARGET)

.PHONY: all clean install run debug
