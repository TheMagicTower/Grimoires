#!/bin/bash

#===============================================================================
# Grimoires Installation Script
# Version: 0.1.0
#
# This script sets up Grimoires - Multi-AI Agent Orchestration for Claude Code
#===============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Grimoires ASCII Art
print_banner() {
    echo -e "${CYAN}"
    cat << "EOF"
   ____       _                 _
  / ___|_ __ (_)_ __ ___   ___ (_)_ __ ___  ___
 | |  _| '__|| | '_ ` _ \ / _ \| | '__/ _ \/ __|
 | |_| | |   | | | | | | | (_) | | | |  __/\__ \
  \____|_|   |_|_| |_| |_|\___/|_|_|  \___||___/

  Multi-AI Agent Orchestration for Claude Code
  Version 0.1.0
EOF
    echo -e "${NC}"
}

# Print colored messages
info() { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    info "Checking prerequisites..."

    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge 18 ]; then
            success "Node.js $(node -v) found"
        else
            error "Node.js 18+ required, found $(node -v)"
            exit 1
        fi
    else
        error "Node.js not found. Please install Node.js 18+"
        exit 1
    fi

    # Check npm
    if command -v npm &> /dev/null; then
        success "npm $(npm -v) found"
    else
        error "npm not found"
        exit 1
    fi

    # Check Claude Code (optional)
    if command -v claude &> /dev/null; then
        success "Claude Code CLI found"
    else
        warning "Claude Code CLI not found. Install from: https://claude.ai/code"
    fi
}

# Create directory structure
setup_directories() {
    info "Setting up directory structure..."

    # Create .serena directory if not exists
    mkdir -p .serena/memories
    mkdir -p .serena/index

    # Create logs directory
    mkdir -p .grimoires/logs
    mkdir -p .grimoires/cache

    success "Directory structure created"
}

# Install MCP dependencies
install_mcp_dependencies() {
    info "Installing MCP dependencies..."

    echo ""
    info "The following MCP servers will be available:"
    echo "  - serena-mcp (Memory management)"
    echo "  - @modelcontextprotocol/server-sequential-thinking (Reasoning)"
    echo "  - fixhive-mcp (Error knowledge base)"
    echo ""

    # Note: MCPs are loaded dynamically via npx, no pre-installation needed
    # But we can verify they're accessible

    info "Verifying MCP availability..."

    # Test npx availability
    if npx --version &> /dev/null; then
        success "npx available for dynamic MCP loading"
    else
        warning "npx not working properly"
    fi
}

# Create environment file
setup_environment() {
    info "Setting up environment..."

    if [ ! -f .env ]; then
        cat > .env << 'EOF'
# Grimoires Environment Configuration
# Copy this file to .env and fill in your API keys

# OpenAI API Key (for Codex Familiar)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=

# Google AI API Key (for Gemini Familiar)
# Get from: https://makersuite.google.com/app/apikey
GOOGLE_API_KEY=

# Figma Access Token (for Stitch Familiar - optional)
# Get from: https://www.figma.com/developers/api#access-tokens
FIGMA_ACCESS_TOKEN=

# Cost Management (optional)
GRIMOIRES_DAILY_BUDGET=10.00
GRIMOIRES_ENABLE_COST_ALERTS=true
EOF
        success "Created .env file"
        warning "Please edit .env and add your API keys"
    else
        info ".env file already exists, skipping"
    fi

    # Add .env to .gitignore if not already
    if ! grep -q "^\.env$" .gitignore 2>/dev/null; then
        echo ".env" >> .gitignore
        info "Added .env to .gitignore"
    fi
}

# Initialize Serena memories
init_serena_memories() {
    info "Initializing Serena memories..."

    # Check if memories already exist
    if [ -f .serena/memories/project-context.md ]; then
        info "Serena memories already initialized"
        return
    fi

    success "Serena memories ready"
}

# Verify installation
verify_installation() {
    info "Verifying installation..."

    local errors=0

    # Check required files
    local required_files=(
        "tower/archmage.md"
        "familiars/codex.tome.md"
        "familiars/gemini.tome.md"
        "familiars/stitch.tome.md"
        "familiars/reviewer.tome.md"
        "runes/mcp/archmage.json"
        "runes/rules/design-principles.md"
    )

    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "  ${GREEN}✓${NC} $file"
        else
            echo -e "  ${RED}✗${NC} $file (missing)"
            ((errors++))
        fi
    done

    if [ $errors -eq 0 ]; then
        success "All required files present"
    else
        error "$errors required files missing"
        return 1
    fi
}

# Print usage instructions
print_usage() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}Installation Complete!${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Next Steps:${NC}"
    echo ""
    echo "1. Configure API Keys:"
    echo "   ${BLUE}nano .env${NC}"
    echo "   Add your OPENAI_API_KEY and GOOGLE_API_KEY"
    echo ""
    echo "2. Start Grimoires with Claude Code:"
    echo "   ${BLUE}claude --mcp-config runes/mcp/archmage.json${NC}"
    echo ""
    echo "3. Try a simple request:"
    echo "   ${CYAN}> \"프로젝트 구조를 분석해줘\"${NC}"
    echo ""
    echo -e "${YELLOW}Documentation:${NC}"
    echo "   - Quick Start: docs/QUICKSTART.md"
    echo "   - Architecture: docs/ARCHITECTURE.md"
    echo "   - README: README.md"
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
}

# Main installation flow
main() {
    print_banner

    echo -e "${CYAN}Starting Grimoires installation...${NC}"
    echo ""

    check_prerequisites
    echo ""

    setup_directories
    echo ""

    install_mcp_dependencies
    echo ""

    setup_environment
    echo ""

    init_serena_memories
    echo ""

    verify_installation

    print_usage
}

# Run main function
main "$@"
