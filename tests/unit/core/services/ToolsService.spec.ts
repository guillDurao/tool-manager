import { expect, describe, it } from '@jest/globals';
import { ToolsRepository } from '../../../../src/infra/repositories/implamentations/ToolsRepository'
import { ToolsService } from '../../../../src/core/services/tools/ToolsService'
import Tool from '../../../../src/core/entities/Tool';

describe('ToolsService', () => {

    const toolMock = {
        title: "json-server",
        link: "https://github.com/typicode/json-server",
        description: "Fake REST API based on a json schema. Useful for mocking and creating APIs for front-end devs to consume in coding",
        tags: [
            "api",
            "json",
            "schema",
            "node",
            "github",
            "rest"
        ]
    }

    const toolsRepository = new ToolsRepository()
    const toolsService = new ToolsService(toolsRepository)

    it('If it can persist a tool', async () => {
        jest.spyOn(Tool, 'create').mockResolvedValue({ id: 1, ...toolMock })
        jest.spyOn(Tool, 'findOne').mockResolvedValueOnce(null)

        await toolsService.create(toolMock)

        expect(Tool.create).toBeCalledWith(
            expect.objectContaining({
                title: toolMock.title
            })
        )
    })

    it('If it throws an error trying to persist a tool', async () => {
        jest.spyOn(Tool, 'create').mockRejectedValue(new Error('Erro interno.'))
        jest.spyOn(Tool, 'findOne').mockResolvedValueOnce(null)

        await expect(toolsService.create(toolMock))
            .rejects.toHaveProperty('message', 'Erro inesperado no servidor.')
    })

    it('If it can persist a tool twice', async () => {
        jest.spyOn(Tool, 'create').mockResolvedValue({ id: 1, ...toolMock })
        jest.spyOn(Tool, 'findOne').mockResolvedValueOnce(null)
        jest.spyOn(Tool, 'findOne').mockResolvedValueOnce(Tool.build(toolMock))

        await toolsService.create(toolMock)

        expect(Tool.create).toBeCalledWith(
            expect.objectContaining({
                title: toolMock.title
            })
        )

        await expect(toolsService.create(toolMock)).rejects.toHaveProperty('message', 'Título informado já existe na nossa base de dados.')
    })

    it('If it validates a tool with description bigger then 256 length', async () => {
        jest.spyOn(Tool, 'findOne').mockResolvedValueOnce(null)

        const deviantToolDTO = { ...toolMock };
        deviantToolDTO.description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam sit amet justo at elit suscipit luctus et ut dolor.'
            + 'Praesent quis tristique libero, commodo semper elit. Sed imperdiet id sapien vel commodo. Suspendisse non commodo eros. '
            + 'Suspendisse eleifend et risus in bibendum. Pellentesque luctus rutrum enim sed tincidunt.'
            + 'Pellentesque sed ex sed tortor semper tincidunt. Fusce ac sapien urna. Sed nec feugiat lorem, quis pulvinar nunc.'

        await expect(toolsService.validateTool(deviantToolDTO))
            .rejects.toHaveProperty('message', 'Descrição acima do tamanho permitido: 256 caracteres.')
    })

    it('If it validates a tool with above 8 tags', async () => {
        jest.spyOn(Tool, 'findOne').mockResolvedValueOnce(null)

        const deviantToolDTO = { ...toolMock };
        deviantToolDTO.tags = [
            "api",
            "json",
            "schema",
            "node",
            "github",
            "rest",
            "web",
            "framework",
            "node"
        ]

        expect(deviantToolDTO.tags).toHaveLength(9)

        await expect(toolsService.validateTool(deviantToolDTO))
            .rejects.toHaveProperty('message', 'Quantidade de tags acima do máximo: 8 tags.')
    })

    it('If it can delete a tool by id', async () => {
        jest.spyOn(Tool, 'destroy').mockResolvedValueOnce(1)

        const rowDeleted = await toolsService.delete(1)


        expect(Tool.destroy).toBeCalledTimes(1)
    })

    it('If it throws an error trying to delete a tool by id', async () => {
        jest.spyOn(Tool, 'destroy').mockRejectedValueOnce(new Error('Erro inesperado no servidor.'))

        await expect(toolsService.delete(1))
            .rejects.toHaveProperty('message', 'Erro inesperado no servidor.')
    })

    it('If it can get all tools', async () => {
        jest.spyOn(Tool, 'findAll').mockResolvedValueOnce([])

        const tools = await toolsService.findAll()

        expect(tools).toBeTruthy()
    })

    it('If it throws an error trying to get all tools', async () => {
        jest.spyOn(Tool, 'findAll').mockRejectedValue(new Error('Erro interno.'))

        await expect(toolsService.findAll())
            .rejects.toHaveProperty('message', 'Erro inesperado no servidor.')
    })

    it('If it can search for tools', async () => {
        jest.spyOn(Tool, 'findAll').mockResolvedValueOnce([])

        const tools = await toolsService.search("valor")

        expect(tools).toBeTruthy()
    })

    it('If it throws an error trying to search for tools', async () => {
        jest.spyOn(Tool, 'findAll').mockRejectedValue(new Error('Erro interno.'))

        await expect(toolsService.search("valor"))
            .rejects.toHaveProperty('message', 'Erro inesperado no servidor.')
    })
})