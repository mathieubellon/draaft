import { expect, test } from "@oclif/test"

describe("layout", () => {
    test.stdout()
        .command(["layout"])
        .it("runs hello", (ctx) => {
            expect(ctx.stdout).to.contain("hello world")
        })

    test.stdout()
        .command(["layout", "--name", "jeff"])
        .it("runs hello --name jeff", (ctx) => {
            expect(ctx.stdout).to.contain("hello jeff")
        })
})
