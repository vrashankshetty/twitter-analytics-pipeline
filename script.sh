#!/bin/bash

# Define the project directory
PROJECT_DIR="$HOME/Documents/Vishu/6thSem/DBT/Project"

# Get screen dimensions using AppleScript - this gets the usable screen area
SCREEN_INFO=$(osascript -e '
tell application "Finder"
    set screenBounds to bounds of window of desktop
    set screenWidth to item 3 of screenBounds
    set screenHeight to item 4 of screenBounds
    return screenWidth & "," & screenHeight
end tell
')

SCREEN_WIDTH=$(echo $SCREEN_INFO | cut -d',' -f1)
SCREEN_HEIGHT=$(echo $SCREEN_INFO | cut -d',' -f2)

# Calculate positions for a 3x2 grid of terminals
# Divide screen exactly into 6 equal parts
WINDOW_WIDTH=$((SCREEN_WIDTH / 3))
WINDOW_HEIGHT=$((SCREEN_HEIGHT / 2))

# Function to open a terminal at specific position
open_positioned_terminal() {
    local row=$1cl
    local col=$2
    
    # Calculate position without any gaps
    local pos_x=$((col * WINDOW_WIDTH))
    local pos_y=$((row * WINDOW_HEIGHT))
    local width=$((pos_x + WINDOW_WIDTH))
    local height=$((pos_y + WINDOW_HEIGHT))
    
    # Open Terminal, run commands, then position and resize the window
    osascript <<EOF
    tell application "Terminal"
        set newWindow to do script "cd $PROJECT_DIR && source venv/bin/activate && docker compose up"
        delay 0.5
        set bounds of front window to {$pos_x, $pos_y, $width, $height}
    end tell
EOF
    
    # Wait a moment before opening next terminal
    sleep 1.5
}

# Activate Terminal app first to ensure it's the front application
osascript -e 'tell application "Terminal" to activate'
sleep 0.5

# Create 6 terminals in a 3x2 grid
echo "Opening 6 terminals in a perfect 3x2 grid..."

# Row 1
open_positioned_terminal 0 0  # Top-left
open_positioned_terminal 0 1  # Top-center
open_positioned_terminal 0 2  # Top-right

# Row 2
open_positioned_terminal 1 0  # Bottom-left
open_positioned_terminal 1 1  # Bottom-center
open_positioned_terminal 1 2  # Bottom-right

echo "All 6 terminals opened and perfectly aligned to fill the entire screen."