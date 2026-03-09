export interface WordToken {
  text: string;
  start: number; // Absolute start index in the original text
  end: number;   // Absolute end index in the original text
  indexInSentence: number; // Index relative to the sentence
}

export interface SentenceToken {
  id: string;
  text: string;
  start: number;
  end: number;
  words: WordToken[];
}

// Voice type is now a string to accommodate the large and growing number of voices
export type VolcVoiceName = string;

export interface PlaybackSettings {
  rate: number; // 0.8 - 2.0
  pitch: number; // Not always supported effectively in all modes, but kept
  volume: number; // 0 - 1
  voice: VolcVoiceName; // Unified voice setting
}

export interface VoiceInfo {
  id: VolcVoiceName;
  name: string;
}

export interface VoiceGroup {
  label: string;
  voices: VoiceInfo[];
}

// Doubao V3 API Credentials — only API Key needed
export interface DoubaoCredentials {
  appId: string;
  apiKey: string;
}

// Comprehensive voice list grouped by category
export const VOICE_GROUPS: VoiceGroup[] = [
  {
    label: '🎀 精品女声',
    voices: [
      { id: 'BV700_V2_streaming', name: '灿灿 2.0（活力故事）' },
      { id: 'BV700_streaming', name: '灿灿（活力故事）' },
      { id: 'BV406_V2_streaming', name: '梓梓 2.0（超自然）' },
      { id: 'BV406_streaming', name: '梓梓（超自然）' },
      { id: 'BV001_V2_streaming', name: '通用女声 2.0' },
      { id: 'BV001_streaming', name: '通用女声' },
      { id: 'BV104_streaming', name: '温柔淑女' },
      { id: 'BV005_streaming', name: '活力女声' },
      { id: 'BV419_streaming', name: '甜美小源' },
    ],
  },
  {
    label: '🌍 English TTS 2.0',
    voices: [
      { id: 'en_male_tim_uranus_bigtts', name: 'Tim（英文男声）' },
      { id: 'en_female_dacey_uranus_bigtts', name: 'Dacey（英文女声）' },
      { id: 'en_female_stokie_uranus_bigtts', name: 'Stokie（英文女声）' },
      { id: 'zh_female_mizai_saturn_bigtts', name: '米仔（中文女声）' },
    ],
  },
  {
    label: '🎩 精品男声',
    voices: [
      { id: 'BV705_streaming', name: '炀炀（自然对话）' },
      { id: 'BV701_V2_streaming', name: '擎苍 2.0（旁白沉浸）' },
      { id: 'BV701_streaming', name: '擎苍（旁白沉浸）' },
      { id: 'BV407_V2_streaming', name: '燃燃 2.0（超自然）' },
      { id: 'BV407_streaming', name: '燃燃（超自然）' },
      { id: 'BV002_streaming', name: '通用男声' },
      { id: 'BV123_streaming', name: '阳光青年' },
      { id: 'BV120_streaming', name: '反卷青年' },
      { id: 'BV119_streaming', name: '通用赘婿' },
      { id: 'BV107_streaming', name: '霸气青叔' },
      { id: 'BV100_streaming', name: '质朴青年' },
    ],
  },
  {
    label: '✨ 特色音色',
    voices: [
      { id: 'BV021_streaming', name: '东北老铁' },
      { id: 'BV113_streaming', name: '甜美台妹' },
      { id: 'BV102_streaming', name: '儒雅青年' },
      { id: 'BV115_streaming', name: '古风少御' },
      { id: 'BV007_streaming', name: '亲切女声' },
      { id: 'BV009_streaming', name: '知性女声' },
      { id: 'BV011_streaming', name: '天才童声' },
      { id: 'BV012_streaming', name: '天真童声' },
    ],
  },
];

// Flat list for backward compatibility
export const VOLC_VOICES: VoiceInfo[] = VOICE_GROUPS.flatMap(g => g.voices);