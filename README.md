# Pomguii Rest Services

@pomgui/rest is a typescript library that makes it easier to create a node REST server using 
[decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to improve the 
reading and writing of REST services source code.

Another tool [@pomgui/rest-codegen](https://github.com/pomgui/rest-codegen) should be used to generate the model, parameter and services ts code.

## Installation

Use npm to install @pomgui/rest.

```bash
npm install @pomgui/rest
npm install -g @pomgui/rest-codegen
```

## Usage Example

### Given an openApi spec input

```yaml
...
/pet/findByStatus:
  get:
    tags:
    - "pet"
    summary: "Finds Pets by status"
    description: "Multiple status values can be provided with comma separated strings"
    operationId: "findPetsByStatus"
    produces:
    - "application/xml"
    - "application/json"
    parameters:
    - name: "status"
    in: "query"
    description: "Status values that need to be considered for filter"
    required: true
    type: "array"
    items:
      type: "string"
      enum:
      - "available"
      - "pending"
      - "sold"
      default: "available"
    collectionFormat: "multi"
    responses:
    200:
      description: "successful operation"
      schema:
      type: "array"
      items:
        $ref: "#/definitions/Pet"
    400:
      description: "Invalid status value"
...
```

And executing the code generator

```bash
restcodegen pets.yaml
```
Which generate `Pet`, `FindPetsByStatusParams`, and other code files.

With them, the following code can be created:

```typescript
/**    
 * Finds Pets by status
 * Multiple status values can be provided with comma separated strings
 */
@PiGET('/pet/findByStatus')
async findPetsByStatus(params: FindPetsByStatusParams): Promise<Pet[]> {
    if(params.status == 'sold')
        throw new PiError('Invalid status value', 400);
    let pets: Pet[] = [{id: 12, name: 'bingo', status: 'sold'}];
    return pets;
}
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)