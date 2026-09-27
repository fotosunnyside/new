#!/usr/bin/env python3
"""Exports the educational content in NutriQuest/Content/*.swift to web/js/content.js.

The iOS app stays the source of truth. Re-run this after editing the Swift content:
    python3 web/tools/export_content.py
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONTENT = ROOT / "NutriQuest" / "Content"
OUT = ROOT / "web" / "js" / "content.js"

TOKEN = re.compile(r'''
    (?P<ws>\s+|//[^\n]*)
  | (?P<str>"(?:\\.|[^"\\])*")
  | (?P<hex>0x[0-9A-Fa-f]+)
  | (?P<num>-?\d+(?:\.\d+)?)
  | (?P<case>\.[A-Za-z_]\w*)
  | (?P<ident>[A-Za-z_]\w*)
  | (?P<punct>[()\[\],:=+])
''', re.VERBOSE)

ESCAPES = {'"': '"', "\\": "\\", "n": "\n", "t": "\t", "'": "'"}


def unescape(lit):
    body = lit[1:-1]
    return re.sub(r'\\(.)', lambda m: ESCAPES.get(m.group(1), m.group(1)), body)


def tokenize(src):
    tokens, pos = [], 0
    while pos < len(src):
        m = TOKEN.match(src, pos)
        if not m:
            tokens.append(("other", src[pos]))
            pos += 1
            continue
        pos = m.end()
        kind = m.lastgroup
        if kind == "ws":
            continue
        tokens.append((kind, m.group()))
    return tokens


class Parser:
    def __init__(self, tokens):
        self.t = tokens
        self.i = 0

    def peek(self, k=0):
        return self.t[self.i + k] if self.i + k < len(self.t) else (None, None)

    def take(self, value=None):
        tok = self.t[self.i]
        if value is not None and tok[1] != value:
            raise SyntaxError(f"expected {value!r}, got {tok!r} at {self.i}")
        self.i += 1
        return tok

    def value(self):
        kind, text = self.peek()
        if kind == "str":
            self.take()
            return unescape(text)
        if kind == "hex":
            self.take()
            return "#%06X" % int(text, 16)
        if kind == "num":
            self.take()
            return float(text) if "." in text else int(text)
        if kind == "case":
            self.take()
            return text[1:]
        if text == "[":
            self.take("[")
            items = []
            while self.peek()[1] != "]":
                items.append(self.value())
                if self.peek()[1] == ",":
                    self.take(",")
            self.take("]")
            return items
        if kind == "ident":
            self.take()
            if text in ("true", "false"):
                return text == "true"
            if text == "nil":
                return None
            if self.peek()[1] == "(":
                return {"_type": text, "args": self.args()}
            return {"_ref": text}
        raise SyntaxError(f"unexpected {text!r} at token {self.i}")

    def args(self):
        self.take("(")
        positional, named = [], {}
        while self.peek()[1] != ")":
            if self.peek()[0] == "ident" and self.peek(1)[1] == ":":
                name = self.take()[1]
                self.take(":")
                named[name] = self.value()
            else:
                positional.append(self.value())
            if self.peek()[1] == ",":
                self.take(",")
        self.take(")")
        return {"pos": positional, "named": named}


def calls(src, type_name):
    """Every top-level `TypeName(...)` call in the source, parsed."""
    tokens = tokenize(src)
    out = []
    for i, (kind, text) in enumerate(tokens):
        if kind == "ident" and text == type_name and i + 1 < len(tokens) and tokens[i + 1][1] == "(":
            p = Parser(tokens)
            p.i = i
            out.append(p.value())
    return out


def question(call):
    prompt, correct, wrong, explanation = call["args"]["pos"]
    return {"prompt": prompt, "correct": correct, "wrong": wrong, "explanation": explanation}


def main():
    cast_src = (CONTENT / "Cast.swift").read_text()
    path_src = (CONTENT / "Pathways.swift").read_text()
    game_src = (CONTENT / "GameContent.swift").read_text()

    cast = []
    for c in calls(cast_src, "MoleculeCharacter"):
        n = c["args"]["named"]
        cast.append({
            "id": n["id"], "name": n["name"], "molecule": n["molecule"], "family": n["family"],
            "shape": n["shape"], "accessory": n["accessory"], "color": n["colorHex"],
            "catchphrase": n["catchphrase"], "bio": n["bio"], "foods": n["foods"],
            "becomes": n["becomes"], "funFact": n["funFact"],
        })

    # Pathway order comes from `static let pathways: [Pathway] = [a, b, c]`.
    order = re.search(r"static let pathways: \[Pathway\] = \[(.*?)\]", path_src, re.S).group(1)
    order = [name.strip() for name in order.split(",") if name.strip()]
    by_name = {}
    for m in re.finditer(r"static let (\w+) = Pathway\(", path_src):
        p = Parser(tokenize(path_src[m.end() - len("Pathway("):]))
        call = p.value()
        n = call["args"]["named"]
        steps = []
        for s in n["steps"]:
            pos = s["args"]["pos"]
            steps.append({"location": pos[0], "star": pos[1], "title": pos[2], "text": pos[3],
                          "helpers": pos[4] if len(pos) > 4 else []})
        by_name[m.group(1)] = {
            "id": n["id"], "title": n["title"], "subtitle": n["subtitle"], "family": n["family"],
            "emoji": n["emoji"], "steps": steps, "check": question(n["check"]),
        }
    pathways = [by_name[name] for name in order]

    quiz_block = game_src.split("static let quizBank")[1].split("static var allQuestions")[0]
    quiz = [question(q) for q in calls(quiz_block, "QuizQuestion")]

    recipes = []
    for r in calls(game_src, "HormoneRecipe"):
        n = r["args"]["named"]
        recipes.append({k: n[k] for k in ("id", "precursor", "wrongPrecursors", "helpers",
                                          "wrongHelpers", "chain", "location", "lesson")})

    tokens = [{"id": t["args"]["named"]["id"], "name": t["args"]["named"]["name"],
               "emoji": t["args"]["named"]["emoji"]}
              for t in calls(game_src, "HelperToken") if isinstance(t["args"]["named"].get("id"), str)]

    fats = [{"name": f["args"]["named"]["name"], "carbons": f["args"]["named"]["carbons"],
             "fact": f["args"]["named"]["fact"]} for f in calls(game_src, "FatMolecule")]

    aminos = [{"code": a["args"]["named"]["code"], "short": a["args"]["named"]["short"],
               "name": a["args"]["named"]["name"], "essential": a["args"]["named"]["essential"],
               "color": a["args"]["named"]["colorHex"]}
              for a in calls(game_src, "AminoAcidInfo") if isinstance(a["args"]["named"].get("short"), str)]

    peptides = [{k: p["args"]["named"][k] for k in ("name", "emoji", "sequence", "decoys", "fact")}
                for p in calls(game_src, "PeptideLevel")]

    helper_src = cast_src.split("helperKeywords")[1].split("= [", 1)[1].split("\n    ]", 1)[0]
    helper_keywords = [[kw, None if target == "nil" else target.strip('"')]
                       for kw, target in re.findall(r'\("([^"]+)",\s*("[^"]*"|nil)\)', helper_src)]

    data = {
        "cast": cast, "pathways": pathways, "quizBank": quiz, "recipes": recipes,
        "helperTokens": tokens, "fats": fats, "aminoAcids": aminos, "peptides": peptides,
        "helperKeywords": helper_keywords,
    }
    header = "// Generated by web/tools/export_content.py from NutriQuest/Content/*.swift. Do not edit by hand.\n"
    OUT.write_text(header + "export const CONTENT = " + json.dumps(data, ensure_ascii=False, indent=1) + ";\n")
    print(f"{len(cast)} characters, {len(pathways)} pathways, {len(quiz)} quiz questions, "
          f"{len(recipes)} recipes, {len(tokens)} helper tokens, {len(fats)} fats, "
          f"{len(aminos)} amino acids, {len(peptides)} peptides, {len(helper_keywords)} helper keywords")


if __name__ == "__main__":
    main()
