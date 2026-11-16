import { TestBed } from '@angular/core/testing';

import { Topics } from './topics';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('Topics', () => {
    let service: Topics;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
               provideHttpClient(),
               provideHttpClientTesting()
            ],
        });
        service = TestBed.inject(Topics);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
