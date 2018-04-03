export interface CommandInterface{
    run(name?: string, version?: string): Promise<number>;
}
