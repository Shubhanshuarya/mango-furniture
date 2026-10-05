#!/usr/bin/env bash
set -e

# Log in to your Shopify store (opens browser)
shopify auth login

# Pull the live theme into the current directory
# Uses the store + theme values from shopify.theme.toml
shopify theme pull --environment development
