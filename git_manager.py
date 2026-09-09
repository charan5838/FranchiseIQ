import os
from dulwich import porcelain
from dulwich.repo import Repo

repo_path = os.path.abspath(".")
repo = Repo(repo_path)

# List of files to add, respecting gitignore
files_to_add = []
ignore_dirs = {'.venv', 'node_modules', '.git', 'dist', '__pycache__', '.system_generated'}

for root, dirs, files in os.walk(repo_path):
    # prune ignore dirs
    dirs[:] = [d for d in dirs if d not in ignore_dirs]
    for file in files:
        if file.endswith(('.sqlite', '.sqlite3', '.pyc', '.log')):
            continue
        rel_path = os.path.relpath(os.path.join(root, file), repo_path).replace('\\', '/')
        files_to_add.append(rel_path)

print(f"Staging {len(files_to_add)} tracked files...")
porcelain.add(repo, paths=files_to_add)

commit_msg = b"Initial commit: FranchiseIQ full-stack financial intelligence and decision-support platform"
commit_id = porcelain.commit(repo, message=commit_msg, author=b"FranchiseIQ Dev <dev@franchiseiq.com>")
print(f"Committed successfully! Hash: {commit_id.decode('ascii')}")

# Ensure branch is refs/heads/main
repo.refs[b'refs/heads/main'] = commit_id
repo.refs.set_symbolic_ref(b'HEAD', b'refs/heads/main')
print("Active branch set to 'main'.")
