// Utility to mathematically reverse SVG path strings for letter stroke inversion

export function reverseSvgPathD(pathD: string): string {
  if (!pathD || typeof pathD !== 'string') return pathD;

  // Match command letters followed by numbers
  const commandRegex = /([a-zA-Z])([^a-zA-Z]*)/g;
  const commands: { type: string; args: number[] }[] = [];
  let match;
  while ((match = commandRegex.exec(pathD)) !== null) {
    const type = match[1];
    const argsStr = match[2].trim();
    const args = argsStr ? argsStr.split(/[\s,]+/).map(Number).filter(n => !isNaN(n)) : [];
    commands.push({ type, args });
  }

  if (commands.length === 0) return pathD;

  // Track start & end of each segment
  let currentX = commands[0].args[0] || 0;
  let currentY = commands[0].args[1] || 0;

  const segments: {
    type: string;
    start: { x: number; y: number };
    end: { x: number; y: number };
    ctrl: number[];
  }[] = [];

  for (let i = 1; i < commands.length; i++) {
    const cmd = commands[i];
    const type = cmd.type.toUpperCase();
    const args = cmd.args;

    if (type === 'L' && args.length >= 2) {
      const endX = args[0];
      const endY = args[1];
      segments.push({
        type: 'L',
        start: { x: currentX, y: currentY },
        end: { x: endX, y: endY },
        ctrl: [],
      });
      currentX = endX;
      currentY = endY;
    } else if (type === 'C' && args.length >= 6) {
      // C cx1 cy1 cx2 cy2 endX endY
      const endX = args[4];
      const endY = args[5];
      segments.push({
        type: 'C',
        start: { x: currentX, y: currentY },
        end: { x: endX, y: endY },
        ctrl: [args[0], args[1], args[2], args[3]],
      });
      currentX = endX;
      currentY = endY;
    } else if (type === 'Q' && args.length >= 4) {
      // Q qx qy endX endY
      const endX = args[2];
      const endY = args[3];
      segments.push({
        type: 'Q',
        start: { x: currentX, y: currentY },
        end: { x: endX, y: endY },
        ctrl: [args[0], args[1]],
      });
      currentX = endX;
      currentY = endY;
    }
  }

  if (segments.length === 0) {
    return pathD;
  }

  const finalPoint = segments[segments.length - 1].end;
  const parts: string[] = [`M ${roundCoord(finalPoint.x)} ${roundCoord(finalPoint.y)}`];

  // Invert segments in reverse order
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i];
    if (seg.type === 'L') {
      parts.push(`L ${roundCoord(seg.start.x)} ${roundCoord(seg.start.y)}`);
    } else if (seg.type === 'C') {
      // P3 -> P0: control points swapped: C cx2 cy2 cx1 cy1 startX startY
      const cx1 = seg.ctrl[0];
      const cy1 = seg.ctrl[1];
      const cx2 = seg.ctrl[2];
      const cy2 = seg.ctrl[3];
      parts.push(
        `C ${roundCoord(cx2)} ${roundCoord(cy2)} ${roundCoord(cx1)} ${roundCoord(cy1)} ${roundCoord(seg.start.x)} ${roundCoord(seg.start.y)}`
      );
    } else if (seg.type === 'Q') {
      const qx = seg.ctrl[0];
      const qy = seg.ctrl[1];
      parts.push(
        `Q ${roundCoord(qx)} ${roundCoord(qy)} ${roundCoord(seg.start.x)} ${roundCoord(seg.start.y)}`
      );
    }
  }

  return parts.join(' ');
}

function roundCoord(val: number): number {
  return Math.round(val * 100) / 100;
}
