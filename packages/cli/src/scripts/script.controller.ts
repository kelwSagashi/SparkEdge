import { Get, RestController } from "@nmg8/di";

@RestController('/scripts')
export class ScriptsController {
    @Get('/')
    async getScripts() {
        return {
            data: [
                {
                    author: "system",
                    created_at: Date.now().toString(),
                    updated_at: Date.now().toString(),
                    name: "sample class",
                    description: "",
                    id: "1",
                    language: "python",
                    main_file_name: "sample_class.py",
                    path: "/extensions/samples/",
                    source: "system_repo",
                    entry_fn: null,
                    repo: null,
                    url: null,
                    version: "1"
                },
                {
                    author: "system",
                    created_at: Date.now().toString(),
                    updated_at: Date.now().toString(),
                    name: "sample class with decorators",
                    description: "",
                    id: "2",
                    language: "python",
                    main_file_name: "sample_class_dec.py",
                    path: "/extensions/samples/",
                    source: "system_repo",
                    entry_fn: null,
                    repo: null,
                    url: null,
                    version: "1"
                },
                {
                    author: "system",
                    created_at: Date.now().toString(),
                    updated_at: Date.now().toString(),
                    name: "sample imp",
                    description: "",
                    id: "3",
                    language: "python",
                    main_file_name: "sample_imp.py",
                    path: "/extensions/samples/",
                    source: "system_repo",
                    entry_fn: null,
                    repo: null,
                    url: null,
                    version: "1"
                },
                {
                    author: "system",
                    created_at: Date.now().toString(),
                    updated_at: Date.now().toString(),
                    name: "sample imp with decorators",
                    description: "",
                    id: "4",
                    language: "python",
                    main_file_name: "sample_imp_dec.py",
                    path: "/extensions/samples",
                    source: "system_repo",
                    entry_fn: null,
                    repo: null,
                    url: null,
                    version: "1"
                },
            ]
        }
    }
}