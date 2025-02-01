# Sacred Geometry Design System

This project implements a design system based on sacred geometry principles, creating a harmonious and mathematically balanced visual experience.

## Key Components

### Colors
- Cosmic Black (#0A0A0F)
- Neon Teal (#00FFCC)
- Cosmic Purple (#663399)
- Sacred Gold (#FFD700)
- Energy Blue (#00A3FF)
- Void Gray (#1A1A2E)

### Proportions
- Golden Ratio: 1.618034
- Silver Ratio: 2.414214
- Base Spacing: 8px (scales with screen size)

### Utility Classes
- `.sacred-container`: Container with golden ratio width
- `.sacred-grid`: Grid system based on sacred proportions
- `.sacred-glass`: Glass morphism effect
- `.sacred-border`: Borders using sacred proportions
- `.sacred-glow`: Neon glow effect
- `.energy-flow`: Pulsing animation
- `.sacred-spin`: Rotation animation
- `.sacred-pattern`: Sacred geometry background pattern
- `.sacred-title`: Gradient text with sacred typography

## Usage

1. Layout Containers:
```jsx
<div className="sacred-container">
  <div className="sacred-glass p-golden">
    // Content here
  </div>
</div>
```

2. Typography:
```jsx
<h1 className="sacred-title">Title</h1>
```

3. Animations:
```jsx
<div className="energy-flow">
  // Animated content
</div>
```

4. Patterns:
```jsx
<div className="sacred-pattern">
  // Content with sacred geometry background
</div>
```

## Best Practices

1. Use the provided spacing units based on the golden ratio
2. Implement glass morphism for elevated elements
3. Apply sacred patterns sparingly to maintain visual hierarchy
4. Utilize energy animations for interactive elements
5. Follow the sacred grid system for layouts

## Integration with Material-UI

The design system is fully integrated with Material-UI through a custom theme that applies sacred geometry principles to components like buttons, papers, and typography.