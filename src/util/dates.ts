import { formatISO, getDaysInMonth, isValid, parseISO } from "date-fns";


/**
 * Simple Date Container to be used allover the codebase, standardize behavior and decouple dependencies
 */
export class DateContainer {

    // Starts with 0
    public calendarYear?: number;
    // Starts with 1
    public calendarMonth?: number;
    // Starts with 1
    public calendarDay?: number;

    private _cachedDate?: Date;

    constructor(
            calendarYear: number | undefined = undefined,
            calendarMonth: number | undefined = undefined,
            calendarDay: number | undefined = undefined,
        ) {
            this.calendarYear = calendarYear;
            this.calendarMonth = calendarMonth;
            this.calendarDay = calendarDay;
    }

    // YYYY-MM-DD
    static fromISO_OnlyDate(isoDate: string|undefined): DateContainer {
        if (isoDate === undefined) {
            return new DateContainer();
        }
        const parseAttempt = parseISO(isoDate);
        return new DateContainer(
            parseAttempt.getFullYear(),
            parseAttempt.getMonth() +1,
            parseAttempt.getDay(),
        );
    }

    // YYYY-MM-DD
    generateISO_OnlyDate(): string | undefined {
        if (!this.isValid()) {
            return undefined;
        }
        const date = this.getDateObject();
        return formatISO(date, {representation: 'date'});
    }

    isValid(): boolean {
        let date: Date;
        try {
            date = this.getDateObject();
        } catch (_) {
            return false;
        }
        return isValid(date);
    }

    getDateObject(): Date {
        if (
            this.calendarYear === undefined
            || this.calendarMonth === undefined
            || this.calendarDay === undefined
        ) {
            const propertiesSummary = JSON.stringify({calendarYear: this.calendarYear, calendarMonth: this.calendarMonth, calendarDay: this.calendarDay});
            throw new Error(`Some date properties are undefined: ${propertiesSummary}`);
        }

        if (
            ! (this._cachedDate === undefined)
            && this._cachedDate.getFullYear() === this.calendarYear
            && this._cachedDate.getMonth() === this.calendarMonth
            && (this._cachedDate.getDay() + 1) === this.calendarDay
        ) {
            return this._cachedDate;
        }

        const date = new Date();
        date.setFullYear(this.calendarYear);
        date.setMonth(this.calendarMonth - 1);
        date.setDate(this.calendarDay);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);
        this._cachedDate = date;
        return date;
    }
    
    getMaxDate(): number {
        if (
            this.calendarYear === undefined
            || this.calendarMonth === undefined
            || this.calendarDay === undefined
        ) {
            return 31;
        }
        return getDaysInMonth(this.getDateObject());
    }

    reset(): DateContainer {
        this._cachedDate = undefined;
        this.calendarYear = undefined;
        this.calendarMonth = undefined;
        this.calendarDay = undefined;
        return this;
    }

    equals(other: DateContainer): boolean {
        return this.calendarYear === other.calendarYear
            && this.calendarMonth === other.calendarMonth
            && this.calendarDay === other.calendarDay
            ;
    }



    

}