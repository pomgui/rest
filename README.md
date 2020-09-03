# Pi Rest Services

Pirest is a typescript library that makes it easier to create a node REST server using 
[decorators](https://www.typescriptlang.org/docs/handbook/decorators.html) to improve the 
reading and writing of REST services source code.

## Installation

Use npm to install pirest.

```bash
npm install pirest --save
```

## Usage Example

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