import Requester from './index';

const testUrl = 'https://baconipsum.com/api/?type=meat-and-filler';
jest.setTimeout(30000);
describe('Test requests', () => {
    const requester = new Requester('', '', '');

    it('Should perform a get request successfully', async () => {
        const getResponse = await requester.get(testUrl, {}, false);

        expect(getResponse).toHaveProperty('data');
        expect(getResponse).toHaveProperty('status');
        expect(typeof getResponse.data).toBe('object');
        expect(typeof getResponse.status).toBe('number');
    });

    it('Should perform a post request successfully', async () => {
        const postResponse = await requester.post(testUrl, {}, {}, false);

        expect(postResponse).toHaveProperty('data');
        expect(postResponse).toHaveProperty('status');
        expect(typeof postResponse.data).toBe('object');
        expect(typeof postResponse.status).toBe('number');
    });

    it('Should perform a put request successfully', async () => {
        const putResponse = await requester.post(testUrl, {}, {}, false);

        expect(putResponse).toHaveProperty('data');
        expect(putResponse).toHaveProperty('status');
        expect(typeof putResponse.data).toBe('object');
        expect(typeof putResponse.status).toBe('number');
    });

    it('Should perform a delete request successfully', async () => {
        const deleteResponse = await requester.delete(testUrl, {}, false);

        expect(deleteResponse).toHaveProperty('data');
        expect(deleteResponse).toHaveProperty('status');
        expect(typeof deleteResponse.data).toBe('object');
        expect(typeof deleteResponse.status).toBe('number');
    });
});
