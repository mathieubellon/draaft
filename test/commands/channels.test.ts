import {expect, test} from '@oclif/test'

describe('channels', () => {
    test
        .stdout()
        .command(['channels'])
        .it('runs hello', ctx => {
            expect(ctx.stdout).to.contain('hello world')
        })

    test
        .stdout()
        .command(['channels', '--name', 'jeff'])
        .it('runs hello --name jeff', ctx => {
            expect(ctx.stdout).to.contain('hello jeff')
        })
})
