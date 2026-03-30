# Design Document: UI Improvements

## Overview

This design document outlines the implementation approach for improving the DRAFTin application's user interface. The improvements focus on three main areas: header element positioning, color consistency for complaint-related elements, and enhanced admin panel navigation using a three-dot menu pattern.

The design maintains the existing Vue.js component structure while making targeted CSS and template modifications to achieve better visual hierarchy, consistent theming, and improved user experience.

## Architecture

### Component Structure

The UI improvements will be implemented across three main components:

1. **Header.vue** - Main navigation header component
   - Contains navigation tabs, user dropdown, and complaint button
   - Handles responsive behavior and user interactions

2. **Admin.vue** - Administrative panel component  
   - Contains sidebar with user information and navigation
   - Manages admin-specific functionality and layout

3. **Complaint.vue** - Complaint/support page component
   - Displays complaint form and related UI elements
   - Handles complaint submission and user feedback

### Design Patterns

- **Progressive Enhancement**: Improvements build upon existing functionality
- **Component Isolation**: Changes are contained within specific components
- **Responsive Design**: All improvements maintain mobile-first approach
- **Accessibility**: Interactive elements follow WCAG guidelines

## Components and Interfaces

### Header Component Modifications

#### Navigation Tab Positioning
- **Current**: Navigation tabs have standard spacing below header
- **Improved**: Reduce top padding/margin to bring tabs closer to header content
- **Implementation**: Modify `.nav-tabs` CSS class padding values

#### Complaint Button Styling
- **Current**: Uses purple/violet color scheme in some states
- **Improved**: Consistent green color scheme matching application theme
- **Implementation**: Update CSS variables and hover states

```css
.complaint-btn {
  color: #00c853; /* Primary green instead of purple */
}

.complaint-btn:hover {
  color: #00b347; /* Darker green for hover */
}

.notification-badge {
  background: #00c853; /* Green instead of purple */
}
```

### Admin Panel Sidebar Enhancement

#### User Information Display
- **Current**: User info with direct navigation links below
- **Improved**: Clean user info display with three-dot menu for actions

#### Three-Dot Menu Implementation
- **Position**: Bottom right of user info section
- **Trigger**: Three dots (⋯) icon button
- **Content**: Dropdown with "Ke Halaman User" option
- **Behavior**: Click to open/close, click outside to close

```vue
<template>
  <div class="user-info">
    <div class="user-avatar">{{ user?.username?.charAt(0).toUpperCase() }}</div>
    <div class="user-details">
      <p class="user-name">{{ user?.username }}</p>
      <p class="user-role">Administrator</p>
    </div>
    <div class="user-menu-container">
      <button class="user-menu-trigger" @click="toggleUserMenu">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="19" cy="12" r="1"></circle>
          <circle cx="5" cy="12" r="1"></circle>
        </svg>
      </button>
      <div v-if="showUserMenu" class="user-menu-dropdown">
        <button @click="handleSwitchToUserPage">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V11m-5.5-4h5.5m0 0v5.5M7.5 19L20 6.5"/>
          </svg>
          Ke Halaman User
        </button>
      </div>
    </div>
  </div>
</template>
```

## Data Models

### Component State Extensions

#### Header Component
```typescript
// Additional reactive state for complaint button theming
const complaintButtonTheme = ref({
  primaryColor: '#00c853',
  hoverColor: '#00b347',
  notificationColor: '#00c853'
})
```

#### Admin Component  
```typescript
// Additional reactive state for user menu
const showUserMenu = ref(false)

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

const handleClickOutside = (event: Event) => {
  // Close menu when clicking outside
  if (!event.target?.closest('.user-menu-container')) {
    showUserMenu.value = false
  }
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, I identified several properties that can be consolidated to eliminate redundancy:

- Properties related to color consistency (2.1, 2.2, 2.3, 2.4) can be combined into comprehensive color validation properties
- Responsive behavior properties (4.1, 4.2, 4.3, 4.4) can be consolidated into viewport-based testing
- Design consistency properties (5.1, 5.2, 5.3, 5.4) can be unified under design system compliance

### Core Properties

**Property 1: Header Element Positioning Consistency**
*For any* viewport size and header configuration, navigation elements should maintain appropriate spacing relationships and the navigation tabs should be positioned closer to header content than the original design
**Validates: Requirements 1.1, 1.2**

**Property 2: Responsive Layout Integrity**  
*For any* screen size change or device orientation, all repositioned elements should maintain proper positioning, functionality, and prevent layout breaks or content overlap
**Validates: Requirements 1.3, 1.4, 4.1, 4.2, 4.3, 4.4**

**Property 3: Color Scheme Consistency**
*For any* complaint-related UI element (buttons, notifications, hover states), the applied colors should match the primary green color palette instead of purple/violet colors
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

**Property 4: Admin Menu Interaction Behavior**
*For any* admin panel interaction, the three-dot menu should appear when clicked, show the correct dropdown content, and properly handle open/close state management
**Validates: Requirements 3.2, 3.3, 3.6**

**Property 5: Admin Navigation Functionality**
*For any* admin user action, selecting "Ke Halaman User" from the three-dot menu should navigate to the main user interface, and the user info section should not display direct navigation links
**Validates: Requirements 3.1, 3.4**

**Property 6: Menu Positioning Accuracy**
*For any* admin panel layout, the three-dot menu should be positioned appropriately within the sidebar footer bounds without overlapping other elements
**Validates: Requirements 3.5**

**Property 7: Design System Compliance**
*For any* modified or new UI element, the styling should conform to the established design system including color palette, spacing scale, and interaction patterns
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

<function_calls>
<invoke name="prework">
<parameter name="featureName">ui-improvements

## Error Handling

### CSS Fallbacks
- **Color Variables**: Provide fallback colors in case CSS custom properties fail
- **Responsive Breakpoints**: Ensure graceful degradation on unsupported viewport sizes
- **Menu State**: Handle edge cases where menu state becomes inconsistent

### JavaScript Error Handling
- **Event Listener Failures**: Gracefully handle cases where click outside detection fails
- **Navigation Errors**: Provide fallback navigation if router push fails
- **State Management**: Ensure menu state resets properly even if errors occur

### Browser Compatibility
- **CSS Grid/Flexbox**: Provide fallbacks for older browsers
- **CSS Custom Properties**: Use PostCSS or similar for variable fallbacks
- **Touch Events**: Ensure mouse events work as fallback for touch interactions

## Testing Strategy

### Dual Testing Approach
The testing strategy combines unit tests for specific functionality and property-based tests for comprehensive validation:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs and configurations
- Both approaches are complementary and necessary for comprehensive coverage

### Unit Testing Focus Areas
- **Component Rendering**: Verify components render correctly with new styling
- **Event Handling**: Test click, hover, and navigation interactions
- **State Management**: Verify menu open/close state transitions
- **Router Integration**: Test navigation to user page functionality
- **Responsive Breakpoints**: Test specific viewport size behaviors

### Property-Based Testing Configuration
- **Minimum 100 iterations** per property test due to randomization
- **Viewport Testing**: Generate random viewport sizes within realistic ranges
- **Color Validation**: Test color values across different themes and states
- **Layout Integrity**: Verify positioning across various content configurations
- **Interaction Patterns**: Test menu behavior with different timing and sequences

### Property Test Implementation
Each correctness property will be implemented as a property-based test with the following tag format:
**Feature: ui-improvements, Property {number}: {property_text}**

Example test structure:
```javascript
// Feature: ui-improvements, Property 3: Color Scheme Consistency
test('complaint elements use green color scheme', () => {
  fc.assert(fc.property(
    fc.record({
      elementType: fc.constantFrom('button', 'notification', 'icon'),
      state: fc.constantFrom('default', 'hover', 'active')
    }),
    ({ elementType, state }) => {
      const element = renderComplaintElement(elementType, state);
      const computedColor = getComputedStyle(element).color;
      expect(computedColor).toMatchGreenColorScheme();
    }
  ));
});
```

### Testing Library Selection
- **Vue Test Utils**: For Vue component testing
- **fast-check**: For property-based testing in JavaScript/TypeScript
- **Testing Library**: For user interaction simulation
- **Jest**: As the test runner and assertion library

The testing strategy ensures that all UI improvements maintain functionality while achieving the desired visual and interaction improvements.