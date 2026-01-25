#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# Grimoires Release Packaging Script
# Creates distribution packages for release
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$PROJECT_ROOT/dist"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "  ╔═══════════════════════════════════════════╗"
echo "  ║     🔮 GRIMOIRES RELEASE PACKAGER 🔮      ║"
echo "  ╚═══════════════════════════════════════════╝"
echo -e "${NC}"

# Get version
VERSION_FILE="$PROJECT_ROOT/version"
if [ -f "$VERSION_FILE" ]; then
    VERSION=$(cat "$VERSION_FILE")
else
    VERSION="0.2.0"
    echo "$VERSION" > "$VERSION_FILE"
fi

echo -e "${BLUE}Packaging version: $VERSION${NC}"
echo ""

# Clean and create dist directory
rm -rf "$DIST_DIR"
mkdir -p "$DIST_DIR"

# Create staging directory
STAGING_DIR=$(mktemp -d)
trap "rm -rf $STAGING_DIR" EXIT

echo -e "${BLUE}Creating package structure...${NC}"

# Create core directory structure
mkdir -p "$STAGING_DIR/core"
mkdir -p "$STAGING_DIR/templates"
mkdir -p "$STAGING_DIR/mcp"
mkdir -p "$STAGING_DIR/scripts"

# Copy core files - check for new structure first, fallback to old
if [ -d "$PROJECT_ROOT/core" ]; then
    cp -r "$PROJECT_ROOT/core/"* "$STAGING_DIR/core/" 2>/dev/null || true
else
    # Fallback: copy from old structure
    [ -d "$PROJECT_ROOT/tower" ] && cp -r "$PROJECT_ROOT/tower" "$STAGING_DIR/core/"
    [ -d "$PROJECT_ROOT/familiars" ] && cp -r "$PROJECT_ROOT/familiars" "$STAGING_DIR/core/"
    [ -d "$PROJECT_ROOT/spells" ] && cp -r "$PROJECT_ROOT/spells" "$STAGING_DIR/core/"
    [ -d "$PROJECT_ROOT/runes/rules" ] && cp -r "$PROJECT_ROOT/runes/rules" "$STAGING_DIR/core/"
fi

# Copy templates
if [ -d "$PROJECT_ROOT/templates" ]; then
    cp -r "$PROJECT_ROOT/templates/"* "$STAGING_DIR/templates/" 2>/dev/null || true
elif [ -d "$PROJECT_ROOT/registry/templates" ]; then
    cp -r "$PROJECT_ROOT/registry/templates/"* "$STAGING_DIR/templates/" 2>/dev/null || true
fi

# Copy MCP configurations
if [ -d "$PROJECT_ROOT/mcp" ]; then
    cp -r "$PROJECT_ROOT/mcp/"* "$STAGING_DIR/mcp/" 2>/dev/null || true
elif [ -d "$PROJECT_ROOT/runes/mcp" ]; then
    cp -r "$PROJECT_ROOT/runes/mcp/"* "$STAGING_DIR/mcp/" 2>/dev/null || true
fi

# Copy scripts
cp "$PROJECT_ROOT/scripts/install.sh" "$STAGING_DIR/scripts/" 2>/dev/null || true
cp "$PROJECT_ROOT/scripts/uninstall.sh" "$STAGING_DIR/scripts/" 2>/dev/null || true
cp "$PROJECT_ROOT/scripts/grimoires" "$STAGING_DIR/scripts/" 2>/dev/null || true

# Copy config template
if [ -f "$PROJECT_ROOT/config.yaml" ]; then
    cp "$PROJECT_ROOT/config.yaml" "$STAGING_DIR/"
else
    # Create default config
    cat > "$STAGING_DIR/config.yaml" << 'EOF'
# Grimoires Global Configuration
version: "0.2.0"

api_keys:
  openai: ${OPENAI_API_KEY}
  google: ${GOOGLE_API_KEY}
  figma: ${FIGMA_ACCESS_TOKEN}

defaults:
  preset: auto
  auto_init: true
  parallel_limit: 4
  familiars:
    - codex
    - gemini
    - reviewer

cost:
  enabled: false
  daily_budget: 10.00
  alerts: true

updates:
  auto_check: true
  channel: stable
EOF
fi

# Copy version file
echo "$VERSION" > "$STAGING_DIR/version"

echo -e "${GREEN}✓ Package structure created${NC}"

# Count files
TOTAL_FILES=$(find "$STAGING_DIR" -type f | wc -l)
echo -e "${BLUE}Total files: $TOTAL_FILES${NC}"

# Create tarball for Unix/macOS
echo ""
echo -e "${BLUE}Creating tarball (grimoires-core.tar.gz)...${NC}"
cd "$STAGING_DIR"
tar -czvf "$DIST_DIR/grimoires-core.tar.gz" . --exclude='.DS_Store' --exclude='*.bak'
TARBALL_SIZE=$(du -h "$DIST_DIR/grimoires-core.tar.gz" | cut -f1)
echo -e "${GREEN}✓ Created grimoires-core.tar.gz ($TARBALL_SIZE)${NC}"

# Create zip for Windows
echo ""
echo -e "${BLUE}Creating zip (grimoires-core.zip)...${NC}"
cd "$STAGING_DIR"
zip -r "$DIST_DIR/grimoires-core.zip" . -x '*.DS_Store' -x '*.bak'
ZIP_SIZE=$(du -h "$DIST_DIR/grimoires-core.zip" | cut -f1)
echo -e "${GREEN}✓ Created grimoires-core.zip ($ZIP_SIZE)${NC}"

# Copy install scripts for direct download
echo ""
echo -e "${BLUE}Copying install scripts...${NC}"
cp "$PROJECT_ROOT/scripts/install.sh" "$DIST_DIR/"
cp "$PROJECT_ROOT/scripts/install.ps1" "$DIST_DIR/"
cp "$PROJECT_ROOT/scripts/install.cmd" "$DIST_DIR/"
cp "$PROJECT_ROOT/scripts/uninstall.sh" "$DIST_DIR/"
cp "$PROJECT_ROOT/scripts/uninstall.ps1" "$DIST_DIR/"
echo -e "${GREEN}✓ Copied install scripts${NC}"

# Create checksums
echo ""
echo -e "${BLUE}Creating checksums...${NC}"
cd "$DIST_DIR"
sha256sum grimoires-core.tar.gz grimoires-core.zip > checksums.sha256
echo -e "${GREEN}✓ Created checksums.sha256${NC}"

# Summary
echo ""
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo -e "${GREEN}  Release packages created successfully!${NC}"
echo -e "${CYAN}═══════════════════════════════════════════${NC}"
echo ""
echo "  Version: $VERSION"
echo "  Output:  $DIST_DIR/"
echo ""
echo "  Files:"
ls -la "$DIST_DIR/"
echo ""
echo "  To create a GitHub release:"
echo "    git tag -a v$VERSION -m 'Release v$VERSION'"
echo "    git push origin v$VERSION"
echo ""
