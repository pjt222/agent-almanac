#!/usr/bin/env python3
"""Prove stage2's P2 'omitted files still live' check can fail: a request that holds only the new
AutoMem block, while User and Project were delivered earlier in the session, must score False."""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from stage2 import score

record = {"tagged": True, "reason": "session_start", "files": {("AutoMem", "/s/memory/MEMORY.md"): "- IDX-B"}, "rendered": None}
block = ("<system-reminder>\nInstruction files were re-read when this session started; x\n\n"
         "Contents of /s/memory/MEMORY.md (user's auto-memory, persists across conversations):\n\n- IDX-B\n</system-reminder>")
body = {"messages": [{"role": "user", "content": [{"type": "text", "text": block}]}]}
earlier = frozenset({("User", "/u/CLAUDE.md"), ("Project", "/p/CLAUDE.md"), ("AutoMem", "/s/memory/MEMORY.md")})
facts = score("negative control", [record], body, None, False, earlier)
print("P2_omitted:", facts["P2_omitted"], "P2_omitted_still_live:", facts["P2_omitted_still_live"])
sys.exit(0 if facts["P2_omitted_still_live"] is False else 1)
