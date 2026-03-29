import os
with open('index.html', encoding='utf-8') as f:
    text = f.read()

text = text.replace('url(\\"data:', 'url("data:')
text = text.replace('%3E\\")', '%3E")')

lines = text.splitlines()
for i, line in enumerate(lines):
    if 'url(\\'data:image/svg+xml,%3Csvg xmlns=\\"http://' in line:
        new_line = line.replace('\\"', "'")
        new_line = new_line.replace("url('data:", 'url("data:')
        new_line = new_line.replace("%3C/svg%3E')", '%3C/svg%3E")')
        lines[i] = new_line

with open('index.html', 'w', encoding='utf-8') as f:
    f.write('\\n'.join(lines))
print("Finished fixing index.html")
