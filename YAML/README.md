# YAML (YAML Ain't Markup Language)

A human-readable data serialization format commonly used for configuration files, especially in Docker and Kubernetes.

## What is YAML?

YAML is a data serialization language designed to be:
- **Human-readable** - Easy to read and write
- **Minimal syntax** - Uses indentation and simple formatting
- **Flexible** - Supports complex data structures
- **Popular** - Used in Docker Compose, Kubernetes, CI/CD pipelines

## YAML Basics

### Comments

```yaml
# Comments start with a hash symbol
# They are ignored by parsers
```

### Key-Value Pairs

```yaml
key: value
another_key: another_value
a_number_value: 42
```

### Nesting (Using Indentation)

**Important**: YAML uses **spaces** for indentation, **NOT tabs**!

```yaml
parent_key:
  child_key1: child_value1
  child_key2: child_value2
  another_nested_key:
    sub_child_key: sub_child_value
```

### Lists/Sequences

```yaml
# Method 1: Dashed list
list_key:
  - list_item1
  - list_item2
  - list_item3

# Method 2: Inline/JSON style
json_seq: [3, 2, 1, "item1", "item2", "item3"]
```

### Maps/Objects

```yaml
# Method 1: Indented format
person:
  name: John Doe
  age: 30
  city: New York

# Method 2: Inline/JSON style
json_map: {"key1": "value1", "key2": "value2"}
```

## Sample YAML File

Here's a complete example demonstrating various YAML features ([sample.yaml](./sample.yaml)):

```yaml
# Comments look like this
key: value
another_key: another_value
a_number_value: 42

# Nesting using indentation
parent_key:
  child_key1: child_value1
  child_key2: child_value2
  another_nested_key:
    sub_child_key: sub_child_value

# Sequence (list) representation
list_key:
  - list_item1
  - list_item2
  - list_item3

# JSON-like syntax
json_map: {"key1": "value1", "key2": "value2"}  
json_seq: [3, 2, 1, "item1", "item2", "item3"]
```

## Data Types in YAML

### Strings

```yaml
# Unquoted strings
simple_string: Hello World

# Quoted strings (use when special characters are involved)
quoted_string: "Hello: World"
single_quoted: 'Hello World'

# Multi-line strings
multiline: |
  This is a multi-line string.
  Each line is preserved.
  Newlines are included.

folded: >
  This is a folded string.
  All lines are folded into
  a single line with spaces.
```

### Numbers

```yaml
integer: 42
float: 3.14
exponential: 1.2e+3
octal: 0o14
hexadecimal: 0xC
```

### Booleans

```yaml
boolean_true: true
boolean_false: false
also_true: yes
also_false: no
```

### Null Values

```yaml
null_value: null
also_null: ~
empty_key:
```

## Advanced Features

### Anchors & Aliases (Reusing Data)

```yaml
# Define an anchor with &
defaults: &defaults
  adapter: postgres
  host: localhost

# Reuse with *
development:
  <<: *defaults
  database: dev_db

production:
  <<: *defaults
  database: prod_db
  host: prod.example.com
```

### Multiple Documents

```yaml
---
document: 1
name: First Document
---
document: 2
name: Second Document
```

## YAML in Docker Compose

Example `docker-compose.yml`:

```yaml
version: '3.8'

services:
  web:
    image: nginx:latest
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/share/nginx/html
    environment:
      - ENV=production
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    volumes:
      - db-data:/var/lib/postgresql/data
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
```

## Best Practices

1. **Use 2 spaces for indentation** - Never use tabs
2. **Quote strings with special characters** - Especially `:`, `{`, `}`, `[`, `]`, `,`, `&`, `*`, `#`, `?`, `|`, `-`, `<`, `>`, `=`, `!`, `%`, `@`, `` ` ``
3. **Be consistent** - Use same style throughout
4. **Use anchors** - Avoid repetition with `&` and `*`
5. **Comment your config** - Explain non-obvious settings
6. **Validate your YAML** - Use online validators or linters

## Common Mistakes

### ❌ Wrong: Using tabs
```yaml
parent:
	child: value  # This will fail!
```

### ✅ Correct: Using spaces
```yaml
parent:
  child: value
```

### ❌ Wrong: Inconsistent indentation
```yaml
parent:
  child1: value
   child2: value  # Extra space causes error
```

### ✅ Correct: Consistent indentation
```yaml
parent:
  child1: value
  child2: value
```

### ❌ Wrong: Unquoted special characters
```yaml
message: Hello: World  # Colon confuses parser
```

### ✅ Correct: Quoted special characters
```yaml
message: "Hello: World"
```

## YAML Validation Tools

### Online Validators
- [YAML Lint](http://www.yamllint.com/)
- [YAML Checker](https://yamlchecker.com/)
- [Code Beautify YAML Validator](https://codebeautify.org/yaml-validator)

### Command Line
```bash
# Using yamllint (install first)
pip install yamllint
yamllint file.yaml

# Using Docker Compose validation
docker compose -f docker-compose.yml config

# Using Python
python -c 'import yaml, sys; yaml.safe_load(sys.stdin)' < file.yaml
```

## Converting Between Formats

### YAML to JSON
```bash
# Using Python
python -c 'import sys, yaml, json; json.dump(yaml.safe_load(sys.stdin), sys.stdout, indent=2)' < file.yaml

# Using yq (install from https://github.com/mikefarah/yq)
yq eval -o=json file.yaml
```

### JSON to YAML
```bash
# Using Python
python -c 'import sys, yaml, json; yaml.dump(json.load(sys.stdin), sys.stdout)' < file.json

# Using yq
yq eval -P file.json
```

## Quick Reference

| Feature | Syntax | Example |
|---------|--------|---------|
| Comment | `#` | `# This is a comment` |
| Key-Value | `key: value` | `name: John` |
| String | `"..."` or `'...'` | `text: "Hello"` |
| Number | Plain | `count: 42` |
| Boolean | `true`/`false` | `enabled: true` |
| Null | `null` or `~` | `value: null` |
| List | `- item` | `- apple`<br>`- banana` |
| Inline List | `[...]` | `items: [1, 2, 3]` |
| Map | Indented | `person:`<br>`  name: John` |
| Inline Map | `{...}` | `person: {name: John}` |
| Multi-line | `\|` or `>` | `text: \|`<br>`  Line 1`<br>`  Line 2` |

## Related Topics

- See [compose/](../compose/) for Docker Compose YAML examples
- Check [examples/](../examples/) for complete YAML configurations
- Explore [basics/](../basics/) for Docker fundamentals

## Resources

- [Official YAML Specification](https://yaml.org/spec/)
- [YAML Reference Card](https://yaml.org/refcard.html)
- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)
