# -*- coding: utf-8 -*-

# GENRATED BY CHAT GPT5

import sys
import os
import io
import json
import re
import argparse

PATTERN = re.compile(r"mod\.stringkeys\.([A-Za-z0-9_.-]+)")

def read_file_text(path):
    """Read a text file as UTF-8, replacing invalid bytes."""
    with io.open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def flatten_dict(d, prefix=""):
    """
    Flatten a (possibly nested) dict into dot-notation keys.
    Arrays are treated as terminal values: we stop at the array key.
    """
    flat = {}
    if isinstance(d, dict):
        for k, v in d.items():
            key = f"{prefix}.{k}" if prefix else str(k)
            if isinstance(v, dict):
                flat.update(flatten_dict(v, key))
            else:
                flat[key] = v
    return flat

def collect_used_keys(paths):
    """Collect unique keys referenced as mod.stringkeys.<key> across TS files."""
    used = set()
    for p in paths:
        text = read_file_text(p)
        for m in PATTERN.findall(text):
            used.add(m)
    return used

def load_json_keys(strings_json_path):
    """Load strings.json and return the set of flattened keys."""
    with io.open(strings_json_path, 'r', encoding='utf-8', errors='strict') as f:
        data = json.load(f)
    flat = flatten_dict(data)
    return set(flat.keys())

def main(argv=None):
    if argv is None:
        argv = sys.argv[1:]

    parser = argparse.ArgumentParser(
        description="Ensure all mod.stringkeys.<key> usages in TS exist in strings.json."
    )
    parser.add_argument("strings_json", help="Path to strings.json")
    parser.add_argument("ts_files", nargs="+", help="One or more .ts files to analyze")
    parser.add_argument("--show-unused", action="store_true",
                        help="Also list keys present in strings.json but not used in TS.")
    args = parser.parse_args(argv)

    if not os.path.isfile(args.strings_json):
        print(f"ERROR: strings.json not found: {args.strings_json}")
        return 2

    for p in args.ts_files:
        if not os.path.isfile(p):
            print(f"ERROR: TS file not found: {p}")
            return 2

    try:
        json_keys = load_json_keys(args.strings_json)
    except Exception as e:
        print(f"ERROR: failed to load/parse strings.json: {e}")
        return 2

    used_keys = collect_used_keys(args.ts_files)

    missing = sorted(k for k in used_keys if k not in json_keys)

    # print(f"Analyzed TS files: {len(args.ts_files)}")
    # print(f"Used keys (unique): {len(used_keys)}")
    # print(f"Available JSON keys: {len(json_keys)}")

    exit_code = 0
    if missing:
        print(f"\nERROR: missing keys in strings.json ({len(missing)}):")
        for k in missing:
            print(f"- {k}")
        exit_code = 1
    else:
        print("\nOK: All used keys are present in strings.json.")

    if args.show_unused:
        unused = sorted(k for k in json_keys if k not in used_keys)
        print(f"\nUnused json keys ({len(unused)}):")
        for k in unused:
            print(f"- {k}")

    return exit_code

if __name__ == "__main__":
    sys.exit(main())
