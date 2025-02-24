class TrieNode {
  children: Map<string, TrieNode>;
  isEndOfPattern: boolean;

  constructor() {
    this.children = new Map();
    this.isEndOfPattern = false;
  }
}

export class Trie {
  private root: TrieNode;

  constructor() {
    this.root = new TrieNode();
  }

  insert(pattern: string): void {
    let node = this.root;
    for (const char of pattern) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }
    node.isEndOfPattern = true;
  }

  search(text: string): boolean {
    for (let i = 0; i < text.length; i++) {
      let node = this.root;
      for (let j = i; j < text.length; j++) {
        if (!node.children.has(text[j])) {
          break;
        }
        node = node.children.get(text[j])!;
        if (node.isEndOfPattern) {
          return true;
        }
      }
    }
    return false;
  }
}
