// Haptics Wrapper
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export async function hapticLight(): Promise<void> {
  try { await Haptics.impact({ style: ImpactStyle.Light }); } catch {}
}

export async function hapticMedium(): Promise<void> {
  try { await Haptics.impact({ style: ImpactStyle.Medium }); } catch {}
}

export async function hapticHeavy(): Promise<void> {
  try { await Haptics.impact({ style: ImpactStyle.Heavy }); } catch {}
}

export async function hapticSuccess(): Promise<void> {
  try { await Haptics.notification({ type: 'success' }); } catch {}
}

export async function hapticWarning(): Promise<void> {
  try { await Haptics.notification({ type: 'warning' }); } catch {}
}

export async function hapticError(): Promise<void> {
  try { await Haptics.notification({ type: 'error' }); } catch {}
}

// Pillar-specific patterns
export async function hapticPrayer(): Promise<void> {
  // 5 light taps for 5 prayers
  for (let i = 0; i < 5; i++) {
    await hapticLight();
    await new Promise(r => setTimeout(r, 50));
  }
}

export async function hapticHealth(): Promise<void> {
  // Heartbeat double-tap
  await hapticMedium();
  await new Promise(r => setTimeout(r, 100));
  await hapticLight();
}

export async function hapticAddictionMilestone(): Promise<void> {
  // Single strong thock
  await hapticHeavy();
}

export async function hapticAchievement(): Promise<void> {
  // Celebration pattern
  await hapticSuccess();
  await new Promise(r => setTimeout(r, 100));
  await hapticLight();
  await new Promise(r => setTimeout(r, 50));
  await hapticLight();
}

export async function hapticCheckin(): Promise<void> {
  await hapticLight();
}

export async function hapticSwipe(): Promise<void> {
  try { await Haptics.selectionStart(); } catch {}
}

export async function hapticSwipeEnd(): Promise<void> {
  try { await Haptics.selectionChanged(); } catch {}
}