from pathlib import Path
path = Path('server/index.js')
text = path.read_text(encoding='utf-8')
old = """const SESSION_TTL_MS = 1000 * 60 * 60 * 6; // 6h\nconst MAX_MESSAGE_LEN = 400;\nconst MAX_POINTS = 1_000_000;"""
new = """const SESSION_TTL_MS = 1000 * 60 * 60 * 6; // 6h\nconst MAX_MESSAGE_LEN = 400;\nconst MAX_POINTS = 1_000_000;\nconst MAX_BTC = 0.1; // limite de BTC por partida\nconst MAX_POINTS_PER_BLOCK = 5000;\nconst MIN_SECONDS_PER_BLOCK = 0.7;"""
if old not in text:
    raise SystemExit('constants not found')
text = text.replace(old, new)
old_fn = """function validateScore(body) {\n  const { points, btc, blocks, duration } = body;\n  if (typeof points !== 'number' || typeof btc !== 'number' || typeof blocks !== 'number' || typeof duration !== 'number') {\n    return 'Invalid types';\n  }\n  if (points < 0 || points > MAX_POINTS) return 'Points out of range';\n  if (blocks < 0 || blocks > 10_000) return 'Blocks out of range';\n  if (duration < 0 || duration > 4 * 60 * 60) return 'Duration out of range';\n  if (blocks > 0 && duration / blocks < 0.5) return 'Unrealistic speed';\n  return null;\n}\n"""
new_fn = """function validateScore(body) {\n  const { points, btc, blocks, duration } = body;\n  if (typeof points !== 'number' || typeof btc !== 'number' || typeof blocks !== 'number' || typeof duration !== 'number') {\n    return 'Invalid types';\n  }\n  if (points < 0 || points > MAX_POINTS) return 'Points out of range';\n  if (blocks < 0 || blocks > 10_000) return 'Blocks out of range';\n  if (btc < 0 || btc > MAX_BTC) return 'BTC out of range';\n  if (duration < 0 || duration > 4 * 60 * 60) return 'Duration out of range';\n  if (blocks > 0) {\n    if (duration / blocks < MIN_SECONDS_PER_BLOCK) return 'Unrealistic speed';\n    if (points / blocks > MAX_POINTS_PER_BLOCK) return 'Points per block too high';\n  }\n  if (points > 0 && blocks === 0) return 'Score requires blocks';\n  return null;\n}\n"""
if old_fn not in text:
    raise SystemExit('validateScore not found')
text = text.replace(old_fn, new_fn)
path.write_text(text, encoding='utf-8')
print('ok')
