#!/bin/bash

# Fix all remaining slides with conservative margins

# Slides 4-12 use similar template, reduce padding/margins consistently

for slide in slide-04-models.html slide-05-breakthroughs.html slide-06-enterprise.html slide-07-public-sector.html slide-08-challenges.html slide-09-democratization.html slide-10-ports.html slide-11-questions.html slide-12-closing.html; do
  echo "Fixing $slide..."
  sed -i '' 's/padding: 30pt/padding: 15pt/g' "$slide"
  sed -i '' 's/padding: 35pt/padding: 18pt/g' "$slide"
  sed -i '' 's/padding: 40pt/padding: 20pt/g' "$slide"
  sed -i '' 's/padding: 50pt/padding: 25pt/g' "$slide"
  sed -i '' 's/margin: 0 0 30pt 0/margin: 0 0 15pt 0/g' "$slide"
  sed -i '' 's/margin: 0 0 40pt 0/margin: 0 0 20pt 0/g' "$slide"
  sed -i '' 's/margin: 0 0 25pt 0/margin: 0 0 12pt 0/g' "$slide"
  sed -i '' 's/margin-bottom: 25pt/margin-bottom: 12pt/g' "$slide"
  sed -i '' 's/margin-bottom: 18pt/margin-bottom: 10pt/g' "$slide"
  sed -i '' 's/margin-bottom: 15pt/margin-bottom: 8pt/g' "$slide"
  sed -i '' 's/font-size: 42pt/font-size: 36pt/g' "$slide"
  sed -i '' 's/font-size: 52pt/font-size: 44pt/g' "$slide"
done

echo "All slides fixed!"
