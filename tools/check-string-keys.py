# -*- coding: utf-8 -*-

# GENRATED BY CHAT GPT 5

from __future__ import print_function
import sys
import os
import io
import json
import re
import argparse

PATTERN = re.compile(r"mod\.stringkeys\.([a-zA-Z0-9_.-]+)")

# Compat Python 2/3
try:
    text_type = unicode  # py2
except NameError:
    text_type = str      # py3

def to_text(s):
    return s if isinstance(s, text_type) else text_type(s)

def read_file_text(path):
    # Lecture UTF-8 tolérante
    with io.open(path, 'r', encoding='utf-8', errors='replace') as f:
        return f.read()

def flatten_dict(d, prefix=""):
    """
    Aplati un dict potentiellement imbriqué en clés 'a.b.c' -> valeur.
    Les tableaux ne sont pas convertis en chemins numérotés : on s'arrête à la clé du tableau.
    """
    flat = {}
    if isinstance(d, dict):
        it = d.iteritems() if hasattr(d, 'iteritems') else d.items()
        for k, v in it:
            key = (prefix + "." + to_text(k)) if prefix else to_text(k)
            if isinstance(v, dict):
                flat.update(flatten_dict(v, key))
            else:
                flat[key] = v
    return flat

def collect_used_keys(paths):
    used = set()
    for p in paths:
        text = read_file_text(p)
        for m in PATTERN.findall(text):
            used.add(m)
    return used

def load_json_keys(strings_json_path):
    with io.open(strings_json_path, 'r', encoding='utf-8', errors='strict') as f:
        data = json.load(f)
    flat = flatten_dict(data)
    return set(flat.keys())

def main(argv=None):
    if argv is None:
        argv = sys.argv[1:]

    parser = argparse.ArgumentParser(
        description="Vérifie que toutes les clés mod.stringkeys.<clé> utilisées dans le JS existent dans strings.json."
    )
    parser.add_argument("strings_json", help="Chemin vers strings.json")
    parser.add_argument("js_files", nargs="*", help="Un ou plusieurs fichiers .js à analyser")
    parser.add_argument("--list-json-keys", action="store_true",
                        help="Affiche toutes les clés disponibles dans strings.json (aplaties) et quitte")
    parser.add_argument("--show-unused", action="store_true",
                        help="Affiche aussi les clés présentes dans strings.json mais non utilisées (optionnel).")

    args = parser.parse_args(argv)

    if not os.path.isfile(args.strings_json):
        print("ERREUR: strings.json introuvable: {}".format(args.strings_json))
        return 2

    for p in args.js_files:
        if not os.path.isfile(p):
            print("ERREUR: fichier JS introuvable: {}".format(p))
            return 2

    try:
        json_keys = load_json_keys(args.strings_json)
    except Exception as e:
        print("ERREUR: impossible de charger/parsing strings.json: {}".format(e))
        return 2

    if args.list_json_keys:
        print("Clés disponibles dans {} ({} clés):".format(args.strings_json, len(json_keys)))
        for k in sorted(json_keys):
            print(k)
        return 0

    used_keys = collect_used_keys(args.js_files)

    missing = sorted(k for k in used_keys if k not in json_keys)

    exit_code = 0
    # print("Fichiers JS analysés: {}".format(len(args.js_files)))
    # print("Clés utilisées (uniques): {}".format(len(used_keys)))
    # print("Clés disponibles dans JSON: {}".format(len(json_keys)))

    if missing:
        print("\nMISSING keys in strings.json ({}):".format(len(missing)))
        for k in missing:
            print("- {}".format(k))
        exit_code = 1
    else:
        print("\n OK: All used keys are present in the strings.json file.")

    # --show-used
    if args.show_unused:
        unused = sorted(k for k in json_keys if k not in used_keys)
        print("\nClés JSON non utilisées ({}):".format(len(unused)))
        for k in unused:
            print("- {}".format(k))

    return exit_code

if __name__ == "__main__":
    sys.exit(main())
