# Chat Support Component

This document outlines the Chat Support feature for Product Mind, which allows users to get assistance with the application through an interactive chat interface.

## Features

- **Fixed Chat Window**: Bottom-right positioned chat window with minimize/maximize capabilities
- **Voice Messages**: Users can send text or record voice messages using the Web Speech API
- **Animated Messages**: CSS animations for smooth user experience:
  - User messages slide in from right (`animate-slide-right`)
  - AI responses fade in (`animate-fade-in`)
  - "Product Mind is typing..." indicator with bouncing dots
- **OpenAI Integration**: Uses GPT-4 for intelligent responses
- **Quick Replies**: Predefined response buttons for common inquiries
- **Supabase Integration**: Messages are stored in the `session_messages` table
- **Feedback Submission**: User feedback is stored in the `feedback` table

## Architecture

The Chat Support feature consists of two key components:

1. **ChatSupport.tsx**: Main component that provides the floating chat button
2. **SupportChatWindow.tsx**: Handles the chat interface, messages, and API interactions

### Dependencies

- `openai`: For AI-powered chat responses
- `supabase`: For message storage
- `lucide-react`: For icons
- Web Speech API: For voice-to-text functionality

## Supabase Schema

### `session_messages` Table

| Field       | Type        | Description                              |
|-------------|-------------|------------------------------------------|
| id          | UUID        | Primary key                              |
| session_id  | UUID        | Unique ID for the chat session           |
| user_id     | UUID        | User's ID                                |
| sender      | TEXT        | 'user' or 'productmind'                  |
| message     | TEXT        | Message content                          |
| type        | TEXT        | 'support'                                |
| timestamp   | TIMESTAMPTZ | Time when the message was sent           |

### `feedback` Table

| Field       | Type        | Description                                    |
|-------------|-------------|------------------------------------------------|
| id          | UUID        | Primary key                                    |
| user_id     | UUID        | User's ID                                      |
| session_id  | UUID        | Associated chat session ID                     |
| message     | TEXT        | Feedback content                               |
| type        | TEXT        | 'feature_request', 'bug_report', or 'general'  |
| status      | TEXT        | 'new', 'in_review', 'resolved', or 'declined'  |
| timestamp   | TIMESTAMPTZ | Time when the feedback was submitted           |

## Usage

To use the Chat Support component in your application:

```jsx
import ChatSupport from '@/components/ChatSupport';

function App() {
  return (
    <div>
      {/* Your app content */}
      <ChatSupport />
    </div>
  );
}
```

The component will automatically render a floating chat button in the bottom-right corner of the page. When clicked, the chat window will open, allowing users to interact with the support system.

## Voice-to-Text Integration

The Chat Support component uses the `useVoiceToText` hook for voice message functionality. This hook:

1. Handles recording states
2. Manages speech recognition using the Web Speech API
3. Converts speech to text for sending as messages

## Animation Details

Animations are implemented using CSS in `src/styles/animations.css` and include:

- `animate-slide-right`: For user messages sliding in from the left
- `animate-fade-in`: For AI responses fading in 
- `animate-typing`: For displaying typing indicators

## Fallback Handling

The component includes fallback mechanisms in case of API failures:

- If Supabase storage fails, messages are stored in localStorage
- If OpenAI API fails, a generic error message is shown 