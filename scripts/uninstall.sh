#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Grimoires Uninstaller for Unix/Linux/macOS
# ============================================================

INSTALL_DIR="${GRIMOIRES_HOME:-$HOME/.grimoires}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${YELLOW}"
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║       🗑️  GRIMOIRES UNINSTALLER 🗑️        ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${NC}"

echo ""
echo -e "${CYAN}This will remove:${NC}"
echo "  - Installation directory: $INSTALL_DIR"
echo "  - PATH and environment variable configuration"
echo "  - Shell rc file modifications"
echo ""
echo -e "${CYAN}This will NOT remove:${NC}"
echo "  - Project-local grimoire.yaml files"
echo "  - Project-local .serena/ directories (optional)"
echo ""

# Confirm
read -p "Remove Grimoires from $INSTALL_DIR? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""

# Remove installation directory
if [ -d "$INSTALL_DIR" ]; then
    rm -rf "$INSTALL_DIR"
    echo -e "${GREEN}✓ Removed $INSTALL_DIR${NC}"
else
    echo -e "${YELLOW}⚠ Directory not found: $INSTALL_DIR${NC}"
fi

# Clean shell rc files
cleaned_rc=false
for rc in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile" "$HOME/.bash_profile"; do
    if [ -f "$rc" ]; then
        # Check if file contains Grimoires config
        if grep -q "GRIMOIRES_HOME" "$rc" 2>/dev/null; then
            # Create backup
            cp "$rc" "${rc}.grimoires.bak"

            # Remove Grimoires-related lines safely
            # Using grep -E to combine patterns, with fallback to copy if no matches
            if grep -v -E "(GRIMOIRES_HOME|# Grimoires)" "$rc" > "${rc}.tmp" 2>/dev/null; then
                mv "${rc}.tmp" "$rc"
            else
                # If grep returns empty or fails, copy original minus the lines manually
                sed -e '/GRIMOIRES_HOME/d' -e '/# Grimoires/d' "$rc" > "${rc}.tmp" 2>/dev/null || cp "${rc}.grimoires.bak" "${rc}.tmp"
                mv "${rc}.tmp" "$rc"
            fi

            # Remove backup if successful
            rm -f "${rc}.grimoires.bak"
            cleaned_rc=true
            echo -e "${GREEN}✓ Cleaned $rc${NC}"
        fi
    fi
done

if [ "$cleaned_rc" = false ]; then
    echo -e "${YELLOW}⚠ No shell configuration to clean${NC}"
fi

# Ask about project-local .grimoires directories
echo ""
read -p "Search for and remove project-local .grimoires/ directories? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Searching for project directories (this may take a moment)..."
    found_dirs=0

    # Search common development directories
    for search_path in "$HOME/Projects" "$HOME/projects" "$HOME/Development" "$HOME/dev" "$HOME/code" "$HOME/workspace" "$HOME/src"; do
        if [ -d "$search_path" ]; then
            while IFS= read -r dir; do
                if [ -n "$dir" ]; then
                    rm -rf "$dir"
                    echo -e "  ${GREEN}✓ Removed $dir${NC}"
                    ((found_dirs++))
                fi
            done < <(find "$search_path" -maxdepth 4 -type d -name ".grimoires" 2>/dev/null)
        fi
    done

    if [ "$found_dirs" -eq 0 ]; then
        echo "  No .grimoires/ directories found in common locations."
    else
        echo -e "  ${GREEN}Removed $found_dirs directories${NC}"
    fi
fi

# Ask about .serena directories
echo ""
read -p "Search for and remove .serena/ directories (memory storage)? [y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Searching for .serena directories..."
    found_dirs=0

    for search_path in "$HOME/Projects" "$HOME/projects" "$HOME/Development" "$HOME/dev" "$HOME/code" "$HOME/workspace" "$HOME/src"; do
        if [ -d "$search_path" ]; then
            while IFS= read -r dir; do
                if [ -n "$dir" ]; then
                    rm -rf "$dir"
                    echo -e "  ${GREEN}✓ Removed $dir${NC}"
                    ((found_dirs++))
                fi
            done < <(find "$search_path" -maxdepth 4 -type d -name ".serena" 2>/dev/null)
        fi
    done

    if [ "$found_dirs" -eq 0 ]; then
        echo "  No .serena/ directories found in common locations."
    else
        echo -e "  ${GREEN}Removed $found_dirs directories${NC}"
    fi
fi

# Success message
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✨ Grimoires uninstalled successfully ✨${NC}"
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""
echo "Notes:"
echo "  - Project grimoire.yaml files were preserved."
echo "    Delete them manually if no longer needed."
echo ""
echo "  - Restart your terminal for PATH changes to take effect."
echo ""
echo "Thank you for using Grimoires!"
echo ""
