export const SUPPORTED_LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C', 'C++',
  'C#', 'Go', 'Rust', 'PHP', 'HTML', 'CSS', 'SQL',
] as const;

export const SUGGESTED_PROMPTS = [
  {
    title: 'Generate Code',
    description: 'Write a function or complete program',
    prompt: 'Write a Python function that implements binary search on a sorted array. Include type hints and handle edge cases.',
    icon: 'Code2',
  },
  {
    title: 'Debug Code',
    description: 'Find and fix errors in your code',
    prompt: 'Debug this code and explain what\'s wrong:\n\n```python\ndef fibonacci(n):\n    if n <= 0:\n        return []\n    result = [0, 1]\n    for i in range(n):\n        result.append(result[-1] + result[-2])\n    return result[:n]\n```',
    icon: 'Bug',
  },
  {
    title: 'Explain Code',
    description: 'Understand how code works step by step',
    prompt: 'Explain how async/await works in JavaScript with a practical real-world example.',
    icon: 'BookOpen',
  },
  {
    title: 'Optimize Code',
    description: 'Improve performance and efficiency',
    prompt: 'Optimize this function and explain the improvement:\n\n```python\ndef find_duplicates(arr):\n    duplicates = []\n    for i in range(len(arr)):\n        for j in range(i + 1, len(arr)):\n            if arr[i] == arr[j] and arr[i] not in duplicates:\n                duplicates.append(arr[i])\n    return duplicates\n```',
    icon: 'Zap',
  },
] as const;

export const API_BASE = import.meta.env.VITE_API_URL || '';
